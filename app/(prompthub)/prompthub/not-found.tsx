import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { EmptyState } from '@/components/prompthub/ui/empty-state';

export default function PromptHubNotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="ページが見つかりませんでした"
      description="URLが変更されたか、削除された可能性があります。ホームまたはプロンプト一覧からお探しください。"
      action={
        <Button asChild variant="primary">
          <Link href={PROMPTHUB_BASE}>ホームへ戻る</Link>
        </Button>
      }
      secondaryAction={
        <Button asChild variant="secondary">
          <Link href={`${PROMPTHUB_BASE}/prompts`}>プロンプト一覧を見る</Link>
        </Button>
      }
    />
  );
}
