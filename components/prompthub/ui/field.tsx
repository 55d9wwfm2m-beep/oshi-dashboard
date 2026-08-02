'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/prompthub/utils';

const CONTROL_BASE =
  'w-full rounded-md border bg-ph-surface text-ph-fg placeholder:text-ph-subtle transition-colors focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-ph-accent disabled:cursor-not-allowed disabled:opacity-60';

/** iOS Safari のフォーカス時自動ズームを避けるため、入力欄は 16px 以上にする */
const CONTROL_SIZE = 'min-h-[44px] px-3 py-2 text-[15px]';

function stateBorder(invalid?: boolean) {
  return invalid ? 'border-ph-danger' : 'border-ph-border hover:border-ph-border-strong';
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(CONTROL_BASE, CONTROL_SIZE, stateBorder(invalid), className)}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL_BASE, 'px-3 py-2.5 text-[15px] leading-relaxed', stateBorder(invalid), className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL_BASE, CONTROL_SIZE, 'cursor-pointer pr-8', stateBorder(invalid), className)}
      {...props}
    >
      {children}
    </select>
  );
});

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  /** 文字数カウンタなどをラベル右端に置く */
  adornment?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** ラベル・補足・エラーを一貫した形で組み立てるフォーム行 */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  adornment,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ph-fg">
          {label}
          {required ? (
            <span className="ml-1 align-middle text-xs font-semibold text-ph-danger">必須</span>
          ) : (
            <span className="ml-1 align-middle text-xs text-ph-subtle">任意</span>
          )}
        </label>
        {adornment ? <span className="text-xs tabular-nums text-ph-subtle">{adornment}</span> : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-ph-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-ph-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: string;
}

/** タップ領域を広く取ったチェックボックス */
export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border border-ph-border px-3 py-2.5 transition-colors hover:bg-ph-surface-2 has-[:checked]:border-ph-accent has-[:checked]:bg-ph-accent-soft',
        className
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-ph-accent"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ph-fg">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-ph-muted">{description}</span> : null}
      </span>
    </label>
  );
}
