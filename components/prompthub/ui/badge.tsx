import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/prompthub/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium leading-5 whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'border-ph-border bg-ph-surface-2 text-ph-muted',
        accent: 'border-ph-accent/25 bg-ph-accent-soft text-ph-accent',
        success: 'border-ph-success/25 bg-ph-success-soft text-ph-success',
        warning: 'border-ph-warning/25 bg-ph-warning-soft text-ph-warning',
        danger: 'border-ph-danger/25 bg-ph-danger-soft text-ph-danger',
        outline: 'border-ph-border text-ph-muted',
      },
    },
    defaultVariants: { tone: 'neutral' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
