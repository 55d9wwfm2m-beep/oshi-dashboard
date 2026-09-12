'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MoneyIcon, { MoneyIconName } from './MoneyIcon';

/**
 * やりくり電卓の画面切り替え。
 * やりくりの6画面は独立した下部ナビで切り替える。
 */
const TABS = [
  { href: '/money', label: 'ホーム', icon: 'home' },
  { href: '/money/balance', label: '残高', icon: 'balance' },
  { href: '/money/budget', label: '予算', icon: 'budget' },
  { href: '/money/roadmap', label: '目標', icon: 'roadmap' },
  { href: '/money/review', label: '振り返り', icon: 'review' },
  { href: '/money/settings', label: '設定', icon: 'settings' },
];

export default function MoneyTabs() {
  const pathname = usePathname();

  return (
    <nav className="tabbar" aria-label="やりくり電卓のメニュー">
      {TABS.map(t => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className="tab"
          >
            <span className="tab-icon"><MoneyIcon name={t.icon as MoneyIconName} /></span>
            <span className="tab-label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
