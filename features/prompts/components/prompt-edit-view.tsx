'use client';

import { ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { EmptyState } from '@/components/prompthub/ui/empty-state';
import { Skeleton } from '@/components/prompthub/ui/skeleton';
import { useToast } from '@/components/prompthub/ui/toast';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import type { PromptDraft } from '@/types/prompthub';
import { PromptForm } from './prompt-form';

export function PromptEditView({ promptId }: { promptId: string }) {
  const router = useRouter();
  const { status, getPrompt, categories, updatePrompt } = usePromptHub();
  const { toast } = useToast();
  const [note, setNote] = useState('');

  const prompt = getPrompt(promptId);

  const initialDraft = useMemo<PromptDraft | undefined>(() => {
    if (!prompt) return undefined;
    return {
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      example: prompt.example,
      category: prompt.category,
      tags: prompt.tags,
      aiTools: prompt.aiTools,
      visibility: prompt.visibility,
      caution: prompt.caution,
    };
  }, [prompt]);

  if (status === 'loading') {
    return (
      <div className="space-y-4" role="status" aria-label="読み込み中">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!prompt || !initialDraft) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="編集するプロンプトが見つかりませんでした"
        description="削除されたか、URLが正しくない可能性があります。一覧から選び直してください。"
        action={
          <Button asChild variant="primary">
            <Link href={`${PROMPTHUB_BASE}/prompts`}>プロンプト一覧へ戻る</Link>
          </Button>
        }
      />
    );
  }

  const handleSubmit = (draft: PromptDraft) => {
    updatePrompt(prompt.id, draft, note.trim() || '内容を更新');
    toast({
      title: '変更を保存しました',
      description: `「${draft.title}」を更新し、更新履歴に記録しました。`,
    });
    router.push(`${PROMPTHUB_BASE}/prompts/${prompt.id}`);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`${PROMPTHUB_BASE}/prompts/${prompt.id}`}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          詳細へ戻る
        </Link>
      </Button>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">プロンプトを編集</h1>
        <p className="text-[15px] text-ph-muted">
          現在のバージョンは v{prompt.version} です。保存すると新しいバージョンとして履歴に残ります。
        </p>
      </div>

      <PromptForm
        initialDraft={initialDraft}
        categories={categories}
        submitLabel="変更を保存"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`${PROMPTHUB_BASE}/prompts/${prompt.id}`)}
        revisionNote={{ value: note, onChange: setNote }}
      />
    </div>
  );
}
