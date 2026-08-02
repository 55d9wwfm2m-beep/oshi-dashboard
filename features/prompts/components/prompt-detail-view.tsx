'use client';

import { ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { ConfirmDialog } from '@/components/prompthub/ui/dialog';
import { EmptyState } from '@/components/prompthub/ui/empty-state';
import { Skeleton } from '@/components/prompthub/ui/skeleton';
import { useToast } from '@/components/prompthub/ui/toast';
import { RecordUsageDialog } from '@/features/history/components/record-usage-dialog';
import { useCopyToClipboard } from '@/hooks/prompthub/use-clipboard';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { findCategoryName } from '@/lib/prompthub/selectors';
import type { AiTool } from '@/types/prompthub';
import { PromptDetail } from './prompt-detail';

export function PromptDetailView({ promptId }: { promptId: string }) {
  const router = useRouter();
  const { status, getPrompt, categories, toggleFavorite, deletePrompt, recordUsage } = usePromptHub();
  const { toast } = useToast();
  const copy = useCopyToClipboard();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  const prompt = getPrompt(promptId);

  if (status === 'loading') {
    return (
      <div className="space-y-4" role="status" aria-label="読み込み中">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="プロンプトが見つかりませんでした"
        description="削除されたか、URLが正しくない可能性があります。一覧から探し直してください。"
        action={
          <Button asChild variant="primary">
            <Link href={`${PROMPTHUB_BASE}/prompts`}>プロンプト一覧へ戻る</Link>
          </Button>
        }
      />
    );
  }

  const handleRecordUsage = (aiTool: AiTool, rating: number) => {
    recordUsage(prompt.id, aiTool, rating);
    toast({
      title: '利用を記録しました',
      description: `${aiTool}での利用として履歴に追加し、利用回数を1件増やしました。`,
    });
  };

  const handleDelete = () => {
    deletePrompt(prompt.id);
    toast({ title: 'プロンプトを削除しました', variant: 'info' });
    router.push(`${PROMPTHUB_BASE}/prompts`);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`${PROMPTHUB_BASE}/prompts`}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          プロンプト一覧へ戻る
        </Link>
      </Button>

      <PromptDetail
        prompt={prompt}
        categoryName={findCategoryName(categories, prompt.category)}
        onCopy={() => void copy(prompt.content)}
        onToggleFavorite={() => {
          const next = toggleFavorite(prompt.id);
          toast({
            title: next ? 'お気に入りに追加しました' : 'お気に入りから外しました',
            variant: next ? 'success' : 'info',
          });
        }}
        onRecordUsage={() => setUsageOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <RecordUsageDialog
        open={usageOpen}
        onOpenChange={setUsageOpen}
        prompt={prompt}
        onRecord={handleRecordUsage}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`「${prompt.title}」を削除しますか？`}
        description="削除するとチーム全員の一覧からも消えます。この操作は取り消せません。利用履歴は記録として残ります。"
        confirmLabel="削除する"
        onConfirm={handleDelete}
      />
    </div>
  );
}
