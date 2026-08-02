'use client';

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/prompthub/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ミリ秒。0 を渡すと自動で消えない */
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, 'description'>> {
  id: number;
  description?: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3600;
const MAX_VISIBLE = 3;

const VARIANT_STYLE: Record<ToastVariant, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-ph-success' },
  error: { icon: XCircle, className: 'text-ph-danger' },
  warning: { icon: AlertTriangle, className: 'text-ph-warning' },
  info: { icon: Info, className: 'text-ph-accent' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'success', duration = DEFAULT_DURATION }: ToastOptions) => {
      seq.current += 1;
      const id = seq.current;
      setItems((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, title, description, variant, duration }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration)
        );
      }
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
      >
        {items.map((item) => {
          const { icon: Icon, className } = VARIANT_STYLE[item.variant];
          return (
            <div
              key={item.id}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-ph-border bg-ph-surface p-4 shadow-ph-lg animate-ph-fade-in"
            >
              <Icon aria-hidden="true" className={cn('mt-0.5 h-5 w-5 shrink-0', className)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ph-fg">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-ph-muted">{item.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="通知を閉じる"
                className="-m-1 rounded p-1 text-ph-subtle transition-colors hover:bg-ph-surface-2 hover:text-ph-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast は ToastProvider の内側で使用してください');
  return context;
}
