'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MONEY_ACCENT, MONEY_ACCENT_BG } from '@/lib/money';

/**
 * やりくり電卓の画面切り替え。
 * アプリ全体の下部ナビと二重にならないよう、上部の横並びタブにしている。
 */
const TABS = [
  { href: '/money', label: 'ホーム', emoji: '🏠' },
  { href: '/money/balance', label: '残高', emoji: '💴' },
  { href: '/money/budget', label: '予算', emoji: '📅' },
  { href: '/money/roadmap', label: '目標', emoji: '🎯' },
  { href: '/money/review', label: '振り返り', emoji: '📊' },
  { href: '/money/settings', label: '設定', emoji: '⚙️' },
];

export default function MoneyTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3" aria-label="やりくり電卓のメニュー">
      {TABS.map(t => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className="shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors"
            style={active
              ? { background: MONEY_ACCENT_BG, color: MONEY_ACCENT }
              : { background: '#F0EBE6', color: '#A8A29E' }}
          >
            <span
              aria-hidden="true"
              style={{ filter: active ? 'none' : 'grayscale(1)', opacity: active ? 1 : 0.6 }}
            >
              {t.emoji}
            </span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
