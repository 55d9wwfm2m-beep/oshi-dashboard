'use client';

import { createPortal } from 'react-dom';

/** 下から出るモーダルシート（全ページ共通・iOS safe-area対応は.bottom-sheet側） */
export default function BottomSheet({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  // body 直下に portal で描画する。ページ側の fadeIn アニメーション（main > *）が
  // スタッキングコンテキストを作るため、ページ内に置くと z-index を上げても
  // ボトムナビ（z-50）の下に描画され、シート下部のボタンが押せなくなる。
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end"
      style={{ background: 'rgba(28,18,12,0.4)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#E0D8D2' }} aria-hidden="true" />
        {title && <h2 className="text-lg font-semibold mb-5" style={{ color: '#1C1917' }}>{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
}
