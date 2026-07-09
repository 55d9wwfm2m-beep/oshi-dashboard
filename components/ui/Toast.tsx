'use client';

import { useEffect, useState } from 'react';

/**
 * 軽量トースト。Provider不要のイベントバス方式。
 * どこからでも showToast('...') を呼べる（フック・ページ・コンポーネント問わず）。
 */
const TOAST_EVENT = 'oshi-toast';

export interface ToastPayload {
  message: string;
  accent?: boolean; // 推しカラー背景で強調
  duration?: number;
}

export function showToast(message: string, opts: Omit<ToastPayload, 'message'> = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: { message, ...opts } }));
}

interface Item extends ToastPayload { id: number; }

/** layout.tsx に1つだけ置く表示器 */
export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let seq = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      if (!detail?.message) return;
      const id = ++seq + Date.now();
      setItems(prev => [...prev.slice(-2), { ...detail, id }]);
      const ttl = detail.duration ?? 2200;
      setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), ttl);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div aria-live="polite" role="status">
      {items.map((t, i) => (
        <div
          key={t.id}
          className={`toast-item${t.accent ? ' toast-accent' : ''}`}
          style={{ bottom: `calc(${84 + i * 46}px + env(safe-area-inset-bottom))` }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
