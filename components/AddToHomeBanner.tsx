'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'oshi-a2hs-dismissed';

/**
 * 「ホーム画面に追加」への誘導バナー。
 * - モバイルブラウザで開いている時だけ表示（PWA起動時・デスクトップでは非表示）
 * - iOS Safariはブラウザ利用のままだと7日間未訪問でデータが消えることがあるため、
 *   ホーム画面追加（=PWA化）がそのままデータ保護になる。
 */
export default function AddToHomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY)) return;
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (standalone) return;
      const mobile = /iPhone|iPad|iPod|Android|Mobile/i.test(window.navigator.userAgent);
      if (!mobile) return;
      setShow(true);
    } catch { /* 表示できなければ何もしない */ }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try { window.localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setShow(false);
  };

  return (
    <div className="card p-4 anim-fadeInUp flex items-start gap-3">
      <span className="text-xl leading-none pt-0.5">📲</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-0.5" style={{ color: '#1C1917' }}>
          「ホーム画面に追加」がおすすめ
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#8F877F' }}>
          アプリみたいにすぐ開けて、ブラウザの自動削除から思い出のデータが守られます。
          共有ボタン→「ホーム画面に追加」でできるよ。
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="この案内を閉じる"
        className="shrink-0 w-8 h-8 -mr-1 -mt-1 flex items-center justify-center rounded-full text-sm"
        style={{ color: '#B8B0A8' }}
      >
        ✕
      </button>
    </div>
  );
}
