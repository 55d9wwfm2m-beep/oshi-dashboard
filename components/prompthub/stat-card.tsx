import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/prompthub/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon: LucideIcon;
  /** 重要な指標は emphasis で一段大きく見せる */
  emphasis?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  emphasis = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-5',
        emphasis
          ? 'border-transparent bg-ph-primary text-ph-primary-fg'
          : 'border-ph-border bg-ph-surface',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn('text-sm font-medium', emphasis ? 'text-ph-primary-fg/75' : 'text-ph-muted')}>
          {label}
        </p>
        <Icon
          aria-hidden="true"
          className={cn('h-4 w-4', emphasis ? 'text-ph-primary-fg/70' : 'text-ph-subtle')}
        />
      </div>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-semibold tabular-nums tracking-tight',
            emphasis ? 'text-4xl' : 'text-3xl text-ph-fg'
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className={cn('text-sm', emphasis ? 'text-ph-primary-fg/75' : 'text-ph-muted')}>
            {unit}
          </span>
        ) : null}
      </p>
      {hint ? (
        <p className={cn('mt-1.5 text-xs', emphasis ? 'text-ph-primary-fg/70' : 'text-ph-subtle')}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
