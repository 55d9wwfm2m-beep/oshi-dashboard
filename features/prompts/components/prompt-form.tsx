'use client';

import { AlertCircle, Eye, PencilLine, Save } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { Button } from '@/components/prompthub/ui/button';
import { ConfirmDialog } from '@/components/prompthub/ui/dialog';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/prompthub/ui/field';
import { Panel } from '@/components/prompthub/ui/surface';
import { useUnsavedChangesWarning } from '@/hooks/prompthub/use-unsaved-changes';
import { LIMITS, VISIBILITY_LABELS } from '@/lib/prompthub/constants';
import { cn, parseTags } from '@/lib/prompthub/utils';
import { AI_TOOLS, VISIBILITY_VALUES, type AiTool, type Category, type PromptDraft, type Visibility } from '@/types/prompthub';
import { hasErrors, validatePromptDraft, type PromptFormErrors } from '../lib/validate';
import { PromptEditor } from './prompt-editor';
import { PromptPreview } from './prompt-preview';

export const EMPTY_DRAFT: PromptDraft = {
  title: '',
  description: '',
  content: '',
  example: '',
  category: '',
  tags: [],
  aiTools: [],
  visibility: 'team',
  caution: '',
};

interface PromptFormProps {
  initialDraft?: PromptDraft;
  categories: Category[];
  submitLabel: string;
  onSubmit: (draft: PromptDraft) => void;
  onCancel: () => void;
  /** 編集時に「何を変えたか」を残してもらう */
  revisionNote?: { value: string; onChange: (value: string) => void };
}

export function PromptForm({
  initialDraft = EMPTY_DRAFT,
  categories,
  submitLabel,
  onSubmit,
  onCancel,
  revisionNote,
}: PromptFormProps) {
  const ids = {
    title: useId(),
    description: useId(),
    category: useId(),
    content: useId(),
    example: useId(),
    tags: useId(),
    caution: useId(),
    note: useId(),
  };

  const [draft, setDraft] = useState<PromptDraft>(initialDraft);
  const [tagInput, setTagInput] = useState(initialDraft.tags.join(', '));
  const [errors, setErrors] = useState<PromptFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [cancelOpen, setCancelOpen] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft) || Boolean(revisionNote?.value),
    [draft, initialDraft, revisionNote?.value]
  );
  useUnsavedChangesWarning(isDirty);

  const update = useCallback(
    <K extends keyof PromptDraft>(key: K, value: PromptDraft[K]) => {
      setDraft((prev) => {
        const next = { ...prev, [key]: value };
        // 一度エラーを出した後は、入力のたびに再検証してすぐ解消が分かるようにする
        setErrors((prevErrors) => (submitted ? validatePromptDraft(next) : prevErrors));
        return next;
      });
    },
    [submitted]
  );

  const toggleAiTool = (tool: AiTool) => {
    const next = draft.aiTools.includes(tool)
      ? draft.aiTools.filter((item) => item !== tool)
      : [...draft.aiTools, tool];
    update('aiTools', next);
  };

  const commitTags = (value: string) => {
    setTagInput(value);
    update('tags', parseTags(value, LIMITS.maxTags));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validatePromptDraft(draft);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      // 最初のエラー項目へ移動して、どこを直せばよいか分かるようにする
      const firstKey = Object.keys(nextErrors)[0];
      const focusId = (ids as Record<string, string>)[firstKey] ?? ids.title;
      document.getElementById(focusId)?.focus();
      return;
    }
    onSubmit({ ...draft, tags: parseTags(tagInput, LIMITS.maxTags) });
  };

  const handleCancel = () => {
    if (isDirty) {
      setCancelOpen(true);
      return;
    }
    onCancel();
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {submitted && errorCount > 0 ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-ph-danger/30 bg-ph-danger-soft px-4 py-3 text-sm text-ph-danger"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>入力内容に{errorCount}件の不備があります。赤字の項目をご確認ください。</p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Panel className="space-y-5 p-5">
            <Field
              label="タイトル"
              htmlFor={ids.title}
              required
              error={errors.title}
              hint="一覧で探しやすい、具体的な名前にしてください。"
              adornment={`${draft.title.length} / ${LIMITS.titleMax}`}
            >
              <Input
                id={ids.title}
                value={draft.title}
                onChange={(event) => update('title', event.target.value)}
                invalid={Boolean(errors.title)}
                maxLength={LIMITS.titleMax + 20}
                placeholder="例: お客様への丁寧なメール返信ドラフト"
              />
            </Field>

            <Field
              label="短い説明"
              htmlFor={ids.description}
              required
              error={errors.description}
              hint="何ができるプロンプトかを1〜2行で書きます。"
              adornment={`${draft.description.length} / ${LIMITS.descriptionMax}`}
            >
              <Input
                id={ids.description}
                value={draft.description}
                onChange={(event) => update('description', event.target.value)}
                invalid={Boolean(errors.description)}
                placeholder="例: 要件と温度感を伝えるだけで、失礼のない返信メールの下書きを作ります。"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="カテゴリー" htmlFor={ids.category} required error={errors.category}>
                <Select
                  id={ids.category}
                  value={draft.category}
                  onChange={(event) => update('category', event.target.value)}
                  invalid={Boolean(errors.category)}
                >
                  <option value="">選択してください</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="公開範囲" required hint="チーム共有にすると全員が閲覧できます。">
                <div className="flex gap-2">
                  {VISIBILITY_VALUES.map((value) => (
                    <Button
                      key={value}
                      variant={draft.visibility === value ? 'accent' : 'secondary'}
                      aria-pressed={draft.visibility === value}
                      onClick={() => update('visibility', value as Visibility)}
                      className="min-h-[44px] flex-1"
                    >
                      {VISIBILITY_LABELS[value]}
                    </Button>
                  ))}
                </div>
              </Field>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ph-fg">
                対応AI
                <span className="ml-1 text-xs font-semibold text-ph-danger">必須</span>
                <span className="ml-2 text-xs font-normal text-ph-subtle">複数選択できます</span>
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {AI_TOOLS.map((tool) => (
                  <Checkbox
                    key={tool}
                    label={tool}
                    checked={draft.aiTools.includes(tool)}
                    onChange={() => toggleAiTool(tool)}
                  />
                ))}
              </div>
              {errors.aiTools ? (
                <p role="alert" className="mt-2 text-sm text-ph-danger">
                  {errors.aiTools}
                </p>
              ) : null}
            </fieldset>
          </Panel>

          <Panel className="space-y-5 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ph-fg">プロンプト本文</h2>
              {/* 画面が狭いときは編集とプレビューを切り替えて使う */}
              <div className="flex rounded-md border border-ph-border p-0.5 lg:hidden" role="tablist" aria-label="表示切り替え">
                {(
                  [
                    { key: 'edit', label: '編集', icon: PencilLine },
                    { key: 'preview', label: 'プレビュー', icon: Eye },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={mobileTab === tab.key}
                    onClick={() => setMobileTab(tab.key)}
                    className={cn(
                      'flex min-h-[36px] items-center gap-1.5 rounded px-3 text-sm transition-colors',
                      mobileTab === tab.key
                        ? 'bg-ph-surface-2 font-medium text-ph-fg'
                        : 'text-ph-muted'
                    )}
                  >
                    <tab.icon aria-hidden="true" className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={cn(mobileTab === 'edit' ? 'block' : 'hidden', 'lg:block')}>
              <Field
                label="本文"
                htmlFor={ids.content}
                required
                error={errors.content}
                hint="差し替える箇所は {{ }} の変数にしておくと、他の人も使い回せます。"
              >
                <PromptEditor
                  id={ids.content}
                  value={draft.content}
                  onChange={(value) => update('content', value)}
                  invalid={Boolean(errors.content)}
                  placeholder={'あなたは〇〇の専門家です。\n\n# 目的\n\n# 入力\n{{ 入力内容 }}\n\n# 出力形式'}
                />
              </Field>
            </div>

            <div className={cn(mobileTab === 'preview' ? 'block' : 'hidden', 'lg:hidden')}>
              <p className="mb-2 text-sm font-medium text-ph-fg">プレビュー</p>
              <PromptPreview content={draft.content} />
            </div>

            <Field
              label="使用例"
              htmlFor={ids.example}
              hint="入力と出力の例があると、初めての人でも使い方が分かります。"
            >
              <Textarea
                id={ids.example}
                value={draft.example}
                onChange={(event) => update('example', event.target.value)}
                rows={5}
                placeholder={'入力: 〇〇\n出力例: 〇〇'}
              />
            </Field>
          </Panel>

          <Panel className="space-y-5 p-5">
            <Field
              label="タグ"
              htmlFor={ids.tags}
              hint={`カンマ・スペース区切りで最大${LIMITS.maxTags}個まで登録できます。`}
              adornment={`${draft.tags.length} / ${LIMITS.maxTags}`}
            >
              <Input
                id={ids.tags}
                value={tagInput}
                onChange={(event) => commitTags(event.target.value)}
                placeholder="例: メール, 顧客対応, 敬語"
              />
            </Field>
            {draft.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5" aria-label="設定中のタグ">
                {draft.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded border border-ph-border bg-ph-surface-2 px-2 py-0.5 text-xs text-ph-muted"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : null}

            <Field
              label="注意事項"
              htmlFor={ids.caution}
              error={errors.caution}
              hint="個人情報や社外秘の扱いなど、使う前に知っておくべきことを書きます。"
              adornment={`${draft.caution.length} / ${LIMITS.cautionMax}`}
            >
              <Textarea
                id={ids.caution}
                value={draft.caution}
                onChange={(event) => update('caution', event.target.value)}
                invalid={Boolean(errors.caution)}
                rows={3}
                placeholder="例: お客様の氏名・注文番号はそのまま貼り付けず、必ず伏せ字にしてください。"
              />
            </Field>

            {revisionNote ? (
              <Field
                label="更新内容のメモ"
                htmlFor={ids.note}
                hint="更新履歴に残ります。空欄の場合は「内容を更新」として記録されます。"
              >
                <Input
                  id={ids.note}
                  value={revisionNote.value}
                  onChange={(event) => revisionNote.onChange(event.target.value)}
                  placeholder="例: 出力形式に文字数制限を追加"
                />
              </Field>
            ) : null}
          </Panel>
        </div>

        {/* デスクトップでは常時プレビューを右に置く */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center gap-2">
              <Eye aria-hidden="true" className="h-4 w-4 text-ph-subtle" />
              <h2 className="text-sm font-medium text-ph-fg">リアルタイムプレビュー</h2>
            </div>
            <PromptPreview content={draft.content} className="max-h-[60dvh] overflow-y-auto" />
            <p className="text-xs leading-relaxed text-ph-subtle">
              見出しと {'{{ 変数 }}'} を色付きで表示しています。実際にコピーされるのは装飾のない本文です。
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-ph-border bg-ph-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-md sm:border sm:px-4">
        <Button variant="secondary" onClick={handleCancel} className="min-h-[44px]">
          キャンセル
        </Button>
        <Button type="submit" variant="primary" className="min-h-[44px]">
          <Save aria-hidden="true" className="h-4 w-4" />
          {submitLabel}
        </Button>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="編集中の内容を破棄しますか？"
        description="保存していない変更があります。このページを離れると入力内容は失われます。"
        confirmLabel="破棄して戻る"
        cancelLabel="編集を続ける"
        onConfirm={onCancel}
      />
    </form>
  );
}
