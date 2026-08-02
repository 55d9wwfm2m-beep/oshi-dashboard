'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CATEGORIES, FALLBACK_CATEGORY_ID } from '@/data/prompthub/categories';
import { CURRENT_USER } from '@/lib/prompthub/constants';
import { createId, nowIso } from '@/lib/prompthub/utils';
import { getRepository } from '@/services/storage';
import type { AiTool, Category, Prompt, PromptDraft, UsageHistory } from '@/types/prompthub';

type Persistence = 'ok' | 'unavailable' | 'error';

interface PromptHubStore {
  status: 'loading' | 'ready';
  persistence: Persistence;
  prompts: Prompt[];
  history: UsageHistory[];
  /** promptCount を集計済みのカテゴリー一覧 */
  categories: Category[];
  getPrompt: (id: string) => Prompt | undefined;
  createPrompt: (draft: PromptDraft) => Prompt;
  updatePrompt: (id: string, draft: PromptDraft, note?: string) => Prompt | undefined;
  /** AI改善の結果でプロンプト本文だけを差し替える */
  replaceContent: (id: string, content: string, note: string) => Prompt | undefined;
  deletePrompt: (id: string) => void;
  toggleFavorite: (id: string) => boolean;
  recordUsage: (id: string, aiTool: AiTool, rating: number) => void;
  createCategory: (name: string, description: string) => Category | undefined;
  updateCategory: (id: string, name: string, description: string) => void;
  deleteCategory: (id: string) => void;
  resetData: () => Promise<void>;
}

const PromptHubContext = createContext<PromptHubStore | null>(null);

const RATING_PRECISION = 10;

function makeRevision(prompt: Prompt, note: string) {
  return {
    version: prompt.version + 1,
    updatedAt: nowIso(),
    author: CURRENT_USER.name,
    note,
  };
}

/** 利用時の評価を、これまでの平均へ反映する */
function nextRating(prompt: Prompt, rating: number): number {
  if (rating <= 0) return prompt.rating;
  const total = prompt.rating * prompt.usageCount + rating;
  const average = total / (prompt.usageCount + 1);
  return Math.round(average * RATING_PRECISION) / RATING_PRECISION;
}

export function PromptHubProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo(() => getRepository(), []);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [persistence, setPersistence] = useState<Persistence>('ok');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [history, setHistory] = useState<UsageHistory[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let active = true;
    repository.load().then((snapshot) => {
      if (!active) return;
      setPrompts(snapshot.prompts);
      setHistory(snapshot.history);
      setRawCategories(snapshot.categories);
      setPersistence(repository.isPersistent() ? 'ok' : 'unavailable');
      setStatus('ready');
    });
    return () => {
      active = false;
    };
  }, [repository]);

  // 変更のたびに保存する。保存に失敗しても状態は保持し、警告表示だけを出す。
  const markSaveResult = useCallback((ok: boolean) => {
    if (!ok) setPersistence((prev) => (prev === 'unavailable' ? prev : 'error'));
  }, []);

  useEffect(() => {
    if (status !== 'ready') return;
    void repository.savePrompts(prompts).then(markSaveResult);
  }, [prompts, status, repository, markSaveResult]);

  useEffect(() => {
    if (status !== 'ready') return;
    void repository.saveHistory(history).then(markSaveResult);
  }, [history, status, repository, markSaveResult]);

  useEffect(() => {
    if (status !== 'ready') return;
    void repository.saveCategories(rawCategories).then(markSaveResult);
  }, [rawCategories, status, repository, markSaveResult]);

  const categories = useMemo<Category[]>(() => {
    const counts = new Map<string, number>();
    prompts.forEach((prompt) => {
      counts.set(prompt.category, (counts.get(prompt.category) ?? 0) + 1);
    });
    return rawCategories.map((category) => ({
      ...category,
      promptCount: counts.get(category.id) ?? 0,
    }));
  }, [prompts, rawCategories]);

  const getPrompt = useCallback(
    (id: string) => prompts.find((prompt) => prompt.id === id),
    [prompts]
  );

  const createPrompt = useCallback((draft: PromptDraft): Prompt => {
    const timestamp = nowIso();
    const prompt: Prompt = {
      ...draft,
      id: createId('prompt'),
      author: CURRENT_USER.name,
      favorite: false,
      usageCount: 0,
      rating: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 1,
      revisions: [{ version: 1, updatedAt: timestamp, author: CURRENT_USER.name, note: '初版を登録' }],
    };
    setPrompts((prev) => [prompt, ...prev]);
    return prompt;
  }, []);

  const updatePrompt = useCallback(
    (id: string, draft: PromptDraft, note = '内容を更新'): Prompt | undefined => {
      let updated: Prompt | undefined;
      setPrompts((prev) =>
        prev.map((prompt) => {
          if (prompt.id !== id) return prompt;
          updated = {
            ...prompt,
            ...draft,
            updatedAt: nowIso(),
            version: prompt.version + 1,
            revisions: [...prompt.revisions, makeRevision(prompt, note)],
          };
          return updated;
        })
      );
      return updated;
    },
    []
  );

  const replaceContent = useCallback((id: string, content: string, note: string) => {
    let updated: Prompt | undefined;
    setPrompts((prev) =>
      prev.map((prompt) => {
        if (prompt.id !== id) return prompt;
        updated = {
          ...prompt,
          content,
          updatedAt: nowIso(),
          version: prompt.version + 1,
          revisions: [...prompt.revisions, makeRevision(prompt, note)],
        };
        return updated;
      })
    );
    return updated;
  }, []);

  const deletePrompt = useCallback((id: string) => {
    setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = !getPrompt(id)?.favorite;
      setPrompts((prev) =>
        prev.map((prompt) => (prompt.id === id ? { ...prompt, favorite: next } : prompt))
      );
      return next;
    },
    [getPrompt]
  );

  const recordUsage = useCallback((id: string, aiTool: AiTool, rating: number) => {
    setPrompts((prev) =>
      prev.map((prompt) => {
        if (prompt.id !== id) return prompt;
        return {
          ...prompt,
          usageCount: prompt.usageCount + 1,
          rating: nextRating(prompt, rating),
        };
      })
    );
    setHistory((prev) => {
      const target = prompts.find((prompt) => prompt.id === id);
      const entry: UsageHistory = {
        id: createId('use'),
        promptId: id,
        promptTitle: target?.title ?? '削除されたプロンプト',
        usedAt: nowIso(),
        aiTool,
        userName: CURRENT_USER.name,
        rating,
      };
      return [entry, ...prev];
    });
  }, [prompts]);

  const createCategory = useCallback(
    (name: string, description: string): Category | undefined => {
      const trimmed = name.trim();
      if (!trimmed) return undefined;
      let created: Category | undefined;
      setRawCategories((prev) => {
        if (prev.some((category) => category.name === trimmed)) return prev;
        created = { id: createId('cat'), name: trimmed, description: description.trim(), promptCount: 0 };
        return [...prev, created];
      });
      return created;
    },
    []
  );

  const updateCategory = useCallback((id: string, name: string, description: string) => {
    setRawCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? { ...category, name: name.trim() || category.name, description: description.trim() }
          : category
      )
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    if (id === FALLBACK_CATEGORY_ID) return;
    setRawCategories((prev) => prev.filter((category) => category.id !== id));
    // 所属していたプロンプトが行方不明にならないよう「その他」へ寄せる
    setPrompts((prev) =>
      prev.map((prompt) =>
        prompt.category === id ? { ...prompt, category: FALLBACK_CATEGORY_ID } : prompt
      )
    );
  }, []);

  const resetData = useCallback(async () => {
    setStatus('loading');
    const snapshot = await repository.reset();
    setPrompts(snapshot.prompts);
    setHistory(snapshot.history);
    setRawCategories(snapshot.categories);
    setStatus('ready');
  }, [repository]);

  const value = useMemo<PromptHubStore>(
    () => ({
      status,
      persistence,
      prompts,
      history,
      categories,
      getPrompt,
      createPrompt,
      updatePrompt,
      replaceContent,
      deletePrompt,
      toggleFavorite,
      recordUsage,
      createCategory,
      updateCategory,
      deleteCategory,
      resetData,
    }),
    [
      status,
      persistence,
      prompts,
      history,
      categories,
      getPrompt,
      createPrompt,
      updatePrompt,
      replaceContent,
      deletePrompt,
      toggleFavorite,
      recordUsage,
      createCategory,
      updateCategory,
      deleteCategory,
      resetData,
    ]
  );

  return <PromptHubContext.Provider value={value}>{children}</PromptHubContext.Provider>;
}

export function usePromptHub(): PromptHubStore {
  const context = useContext(PromptHubContext);
  if (!context) throw new Error('usePromptHub は PromptHubProvider の内側で使用してください');
  return context;
}
