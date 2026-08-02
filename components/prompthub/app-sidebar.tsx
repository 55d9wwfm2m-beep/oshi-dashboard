'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, CURRENT_USER } from '@/lib/prompthub/constants';
import { cn } from '@/lib/prompthub/utils';
import { NAV_ITEMS, PROMPTHUB_BASE, isNavActive } from './nav-items';

interface AppSidebarProps {
  /** ドロワー内で使うときに、リンク押下でドロワーを閉じる */
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-ph-surface-2">
      <Link
        href={PROMPTHUB_BASE}
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ph-accent"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded bg-ph-primary text-sm font-bold text-ph-primary-fg"
        >
          P
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-ph-fg">{APP_NAME}</span>
      </Link>

      <nav aria-label="メインナビゲーション" className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[40px] items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent',
                    active
                      ? 'bg-ph-surface font-medium text-ph-fg shadow-ph-xs'
                      : 'text-ph-muted hover:bg-ph-surface/70 hover:text-ph-fg'
                  )}
                >
                  <item.icon
                    aria-hidden="true"
                    className={cn('h-[18px] w-[18px]', active ? 'text-ph-accent' : 'text-ph-subtle')}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-ph-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ph-accent-soft text-xs font-semibold text-ph-accent"
          >
            {CURRENT_USER.initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ph-fg">{CURRENT_USER.name}</span>
            <span className="block truncate text-xs text-ph-subtle">{CURRENT_USER.role}</span>
          </span>
        </div>
        <p className="px-2 pb-1 pt-2 text-[11px] leading-relaxed text-ph-subtle">
          MVP版のためログイン機能はありません。データはこの端末に保存されます。
        </p>
      </div>
    </div>
  );
}
