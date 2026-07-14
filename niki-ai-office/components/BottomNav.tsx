'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'オフィス', emoji: '🏢' },
  { href: '/request', label: '依頼', emoji: '✉️' },
  { href: '/board', label: 'ボード', emoji: '🗂️' },
  { href: '/meeting', label: '会議', emoji: '💬' },
  { href: '/report', label: '日報', emoji: '📊' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname.startsWith('/employees');
  return pathname === href || pathname.startsWith(href + '/');
}

export function BottomNav() {
  const pathname = usePathname() || '/';

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-navy-800/10 bg-cream-50/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="メインナビゲーション"
    >
      <ul className="mx-auto flex w-full max-w-[560px] items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-pixel px-1 py-1.5 text-[11px] font-bold transition ${
                  active ? 'text-sky-500' : 'text-navy-500'
                }`}
              >
                <span
                  className={`text-lg leading-none transition ${active ? 'scale-110' : ''}`}
                  aria-hidden
                >
                  {tab.emoji}
                </span>
                <span>{tab.label}</span>
                <span
                  className={`h-1 w-1 rounded-full ${active ? 'bg-sky-400' : 'bg-transparent'}`}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
