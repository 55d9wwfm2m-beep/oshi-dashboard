import { cn } from '@/lib/prompthub/utils';

/** 面（カード）。すべてをカードで囲まないよう、必要な箇所だけで使う。 */
export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-ph-border bg-ph-surface shadow-ph-xs', className)}
      {...props}
    />
  );
}

interface SectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** 見出しの大きさ。情報の重要度で使い分ける。 */
  level?: 'page' | 'section';
}

/** 見出し＋操作＋本文を一定のリズムで並べるセクション */
export function Section({
  title,
  description,
  action,
  children,
  className,
  level = 'section',
}: SectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2
            className={cn(
              'font-semibold tracking-tight text-ph-fg',
              level === 'page' ? 'text-xl' : 'text-base'
            )}
          >
            {title}
          </h2>
          {description ? <p className="text-sm text-ph-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Separator({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-ph-border', className)} />;
}
