import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/prompthub/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** 次に取るべき行動が分かる説明を必ず入れる */
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-ph-border bg-ph-surface px-6 py-14 text-center',
        className
      )}
    >
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-ph-surface-2 text-ph-muted">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <h3 className="text-base font-semibold text-ph-fg">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ph-muted">{description}</p>
      {action || secondaryAction ? (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
