'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/prompthub/utils';
import { Button } from './button';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

function Overlay({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-slate-900/50 animate-ph-overlay-in', className)}
    />
  );
}

interface DialogContentProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * 中央モーダル。Radix によりフォーカストラップ・Escape・aria-modal が担保される。
 */
export function DialogContent({ title, description, children, footer, className }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-ph-border bg-ph-surface shadow-ph-lg animate-ph-dialog-in',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ph-border px-5 py-4">
          <div className="space-y-1">
            <DialogPrimitive.Title className="text-base font-semibold text-ph-fg">
              {title}
            </DialogPrimitive.Title>
            {/* 説明がない場合も、スクリーンリーダー向けに必ず説明要素を持たせる */}
            <DialogPrimitive.Description
              className={description ? 'text-sm leading-relaxed text-ph-muted' : 'sr-only'}
            >
              {description ?? `${title}のダイアログです`}
            </DialogPrimitive.Description>
          </div>
          <DialogPrimitive.Close
            aria-label="閉じる"
            className="-m-1 rounded p-1 text-ph-subtle transition-colors hover:bg-ph-surface-2 hover:text-ph-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </DialogPrimitive.Close>
        </div>
        {children ? <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div> : null}
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-ph-border px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 削除など取り消せない操作は 'danger' にする */
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  children?: React.ReactNode;
}

/** 削除・上書きなど、取り消せない操作の前に必ず挟む確認ダイアログ */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '実行する',
  cancelLabel = 'キャンセル',
  tone = 'danger',
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title}
        description={description}
        className="max-w-md"
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary">{cancelLabel}</Button>
            </DialogClose>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </>
        }
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
