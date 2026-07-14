import Link from 'next/link';

// ローディング（スケルトン）
export function LoadingState({ label = '読み込み中…' }: { label?: string }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <p className="text-sm font-bold text-navy-500">{label}</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="panel animate-pulse p-4">
          <div className="mb-2 h-4 w-1/3 rounded bg-navy-800/10" />
          <div className="h-3 w-2/3 rounded bg-navy-800/10" />
        </div>
      ))}
    </div>
  );
}

// 空状態
export function EmptyState({
  icon = '🗒️',
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="panel flex flex-col items-center gap-2 px-5 py-10 text-center">
      <div className="text-4xl" aria-hidden>
        {icon}
      </div>
      <p className="text-base font-bold text-navy-800">{title}</p>
      {description && <p className="max-w-[36ch] text-sm text-navy-600">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// エラー状態
export function ErrorState({
  title = 'うまく表示できませんでした',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="panel flex flex-col items-center gap-2 border-rose-200 bg-rose-50/60 px-5 py-10 text-center">
      <div className="text-4xl" aria-hidden>
        ⚠️
      </div>
      <p className="text-base font-bold text-rose-700">{title}</p>
      {message && <p className="max-w-[40ch] text-sm text-rose-600">{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost mt-2">
          もう一度ためす
        </button>
      )}
    </div>
  );
}
