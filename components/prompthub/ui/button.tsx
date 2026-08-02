'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/lib/prompthub/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-ph-primary text-ph-primary-fg hover:bg-ph-primary-hover',
        secondary: 'border border-ph-border bg-ph-surface text-ph-fg hover:bg-ph-surface-2',
        ghost: 'text-ph-muted hover:bg-ph-surface-2 hover:text-ph-fg',
        accent: 'bg-ph-accent text-white hover:brightness-110',
        danger: 'bg-ph-danger text-white hover:brightness-110',
        'danger-outline':
          'border border-ph-danger/40 text-ph-danger hover:bg-ph-danger-soft',
        link: 'text-ph-accent underline-offset-4 hover:underline',
      },
      size: {
        // タップ領域を確保するため、最小の高さは 36px 以上に揃えている
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, type, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...props}
    />
  );
});

export { buttonVariants };
