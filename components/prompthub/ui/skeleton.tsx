import { cn } from '@/lib/prompthub/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-ph-surface-2', className)} aria-hidden="true" />;
}

/** 一覧の読み込み中に表示する行スケルトン */
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-px overflow-hidden rounded-lg border border-ph-border bg-ph-border" role="status" aria-label="読み込み中">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2.5 bg-ph-surface px-4 py-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
      <span className="sr-only">読み込み中です</span>
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="読み込み中">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-ph-border bg-ph-surface p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
