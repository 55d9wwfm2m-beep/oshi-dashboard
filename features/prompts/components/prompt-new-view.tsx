'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { useToast } from '@/components/prompthub/ui/toast';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { IMPROVED_DRAFT_KEY } from '@/lib/prompthub/constants';
import type { PromptDraft } from '@/types/prompthub';
import { EMPTY_DRAFT, PromptForm } from './prompt-form';

export function PromptNewView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, createPrompt, getPrompt } = usePromptHub();
  const { toast } = useToast();

  // AI改善画面から「改善版として保存」で遷移してきた場合、内容を引き継ぐ
  const sourceId = searchParams.get('from');
  const initialDraft = useMemo<PromptDraft>(() => {
    const draftContent = typeof window === 'undefined' ? null : window.sessionStorage.getItem(IMPROVED_DRAFT_KEY);
    const source = sourceId ? getPrompt(sourceId) : undefined;
    if (!source || !draftContent) return EMPTY_DRAFT;
    return {
      title: `${source.title}（改善版）`,
      description: source.description,
      content: draftContent,
      example: source.example,
      category: source.category,
      tags: source.tags,
      aiTools: source.aiTools,
      visibility: source.visibility,
      caution: source.caution,
    };
  }, [sourceId, getPrompt]);

  const handleSubmit = (draft: PromptDraft) => {
    const created = createPrompt(draft);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(IMPROVED_DRAFT_KEY);
    }
    toast({
      title: 'プロンプトを登録しました',
      description: `「${created.title}」を一覧に追加しました。`,
    });
    router.push(`${PROMPTHUB_BASE}/prompts/${created.id}`);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`${PROMPTHUB_BASE}/prompts`}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          プロンプト一覧へ戻る
        </Link>
      </Button>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">プロンプトを登録</h1>
        <p className="text-[15px] text-ph-muted">
          自分だけが知っている使い方を、チームが再現できる形にして残します。
        </p>
      </div>

      <PromptForm
        initialDraft={initialDraft}
        categories={categories}
        submitLabel="登録する"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`${PROMPTHUB_BASE}/prompts`)}
      />
    </div>
  );
}
