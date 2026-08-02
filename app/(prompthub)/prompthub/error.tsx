'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';

/**
 * 画面が真っ白にならないためのエラーバウンダリ。
 * 想定外の例外が起きても、復帰手段（再試行・ホームへ戻る）を必ず提示する。
 */
export default function PromptHubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 開発時の調査用。ここ以外では console を残さない。
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-ph-border bg-ph-surface px-6 py-16 text-center">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-ph-danger-soft text-ph-danger">
        <AlertTriangle aria-hidden="true" className="h-5 w-5" />
      </span>
      <h1 className="text-lg font-semibold text-ph-fg">画面の表示中に問題が発生しました</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ph-muted">
        保存されているデータは失われていません。もう一度読み込むか、ホームへ戻ってやり直してください。
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button variant="primary" onClick={reset}>
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          もう一度読み込む
        </Button>
        <Button asChild variant="secondary">
          <Link href={PROMPTHUB_BASE}>ホームへ戻る</Link>
        </Button>
      </div>
    </div>
  );
}
