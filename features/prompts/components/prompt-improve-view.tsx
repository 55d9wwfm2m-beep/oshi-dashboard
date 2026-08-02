'use client';

import { ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { EmptyState } from '@/components/prompthub/ui/empty-state';
import { Skeleton } from '@/components/prompthub/ui/skeleton';
import { useToast } from '@/components/prompthub/ui/toast';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { IMPROVED_DRAFT_KEY } from '@/lib/prompthub/constants';
import { ImprovePromptPanel } from './improve-prompt-panel';

export function PromptImproveView({ promptId }: { promptId: string }) {
  const router = useRouter();
  const { status, getPrompt, replaceContent } = usePromptHub();
  const { toast } = useToast();

  const prompt = getPrompt(promptId);

  if (status === 'loading') {
    return (
      <div className="space-y-4" role="status" aria-label="読み込み中">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="改善するプロンプトが見つかりませんでした"
        description="削除されたか、URLが正しくない可能性があります。一覧から選び直してください。"
        action={
          <Button asChild variant="primary">
            <Link href={`${PROMPTHUB_BASE}/prompts`}>プロンプト一覧へ戻る</Link>
          </Button>
        }
      />
    );
  }

  const handleSaveAsNew = (content: string) => {
    window.sessionStorage.setItem(IMPROVED_DRAFT_KEY, content);
    toast({
      title: '改善版を登録画面に読み込みました',
      description: '内容を確認して登録してください。元のプロンプトはそのまま残ります。',
    });
    router.push(`${PROMPTHUB_BASE}/prompts/new?from=${prompt.id}`);
  };

  const handleReplace = (content: string) => {
    replaceContent(prompt.id, content, 'AI改善の結果で本文を置き換え');
    toast({
      title: '本文を置き換えました',
      description: `v${prompt.version + 1} として更新履歴に記録しました。`,
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
        <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">AIでプロンプトを改善</h1>
        <p className="text-[15px] text-ph-muted">
          「{prompt.title}」を、役割・条件・出力形式が明確な形に整えます。
        </p>
      </div>

      <ImprovePromptPanel prompt={prompt} onSaveAsNew={handleSaveAsNew} onReplace={handleReplace} />
    </div>
  );
}
