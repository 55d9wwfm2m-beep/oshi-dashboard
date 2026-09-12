'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';

/** 下から出るモーダルシート（全ページ共通・iOS safe-area対応は.bottom-sheet側） */
export default function BottomSheet({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => {
      const first = panel.current?.querySelector<HTMLElement>('input:not([disabled]), select, button:not([disabled])');
      (first ?? panel.current)?.focus();
    });
    return () => { cancelAnimationFrame(frame); document.body.style.overflow = overflow; previous?.focus(); };
  }, [open]);
  if (!open) return null;
  // body 直下に portal で描画する。ページ側の fadeIn アニメーション（main > *）が
  // スタッキングコンテキストを作るため、ページ内に置くと z-index を上げても
  // ボトムナビ（z-50）の下に描画され、シート下部のボタンが押せなくなる。
  return createPortal(
    <div
      className="money-overlay fixed inset-0 z-[60] flex items-end"
      style={{ background: 'rgba(28,18,12,0.4)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={e => {
        if (e.key === 'Escape') { e.preventDefault(); close.current(); }
        if (e.key !== 'Tab') return;
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, a[href], [tabindex="0"]') ?? []).filter(el => el.getClientRects().length);
        const first = items[0], last = items[items.length - 1];
        if (!first) { e.preventDefault(); return; }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }}
    >
      <div className="bottom-sheet" ref={panel} tabIndex={-1} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#E0D8D2' }} aria-hidden="true" />
        {title && <h2 className="text-lg font-semibold mb-5" style={{ color: '#1C1917' }}>{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
}
