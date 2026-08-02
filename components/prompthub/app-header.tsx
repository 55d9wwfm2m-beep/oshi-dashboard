'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Menu, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { APP_NAME } from '@/lib/prompthub/constants';
import { Button } from '@/components/prompthub/ui/button';
import { AppSidebar } from './app-sidebar';
import { NAV_ITEMS, PROMPTHUB_BASE, isNavActive } from './nav-items';
import { ThemeToggle } from './theme-toggle';

/** パスから画面名を決める。ナビ項目より下層ページを先に判定する。 */
function resolveTitle(pathname: string): string {
  if (pathname === `${PROMPTHUB_BASE}/prompts/new`) return 'プロンプトを登録';
  if (pathname.startsWith(`${PROMPTHUB_BASE}/improve`)) return 'AIで改善';
  if (pathname.endsWith('/improve')) return 'AIで改善';
  if (pathname.endsWith('/edit')) return 'プロンプトを編集';
  if (/^\/prompthub\/prompts\/[^/]+$/.test(pathname)) return 'プロンプト詳細';

  const navItem = NAV_ITEMS.find((item) => isNavActive(pathname, item));
  return navItem?.label ?? APP_NAME;
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  // 画面が変わったらドロワーは必ず閉じる
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = keyword.trim();
    router.push(query ? `${PROMPTHUB_BASE}/prompts?q=${encodeURIComponent(query)}` : `${PROMPTHUB_BASE}/prompts`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ph-border bg-ph-surface/95 backdrop-blur supports-[backdrop-filter]:bg-ph-surface/80">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DialogPrimitive.Trigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="メニューを開く">
              <Menu aria-hidden="true" className="h-5 w-5" />
            </Button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-900/50 animate-ph-overlay-in lg:hidden" />
            <DialogPrimitive.Content
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-ph-border animate-ph-sheet-in lg:hidden"
              aria-describedby={undefined}
            >
              <DialogPrimitive.Title className="sr-only">メインメニュー</DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="メニューを閉じる"
                className="absolute right-3 top-4 z-10 rounded p-2 text-ph-subtle transition-colors hover:bg-ph-surface hover:text-ph-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </DialogPrimitive.Close>
              <AppSidebar onNavigate={() => setDrawerOpen(false)} />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        {/* 各ページが h1 を持つため、ヘッダーの表示名は見出しにしない */}
        <p className="truncate text-[15px] font-semibold tracking-tight text-ph-fg lg:text-base">
          {resolveTitle(pathname)}
        </p>

        <form role="search" onSubmit={submitSearch} className="ml-auto hidden md:block">
          <label htmlFor="ph-global-search" className="sr-only">
            プロンプトを検索
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ph-subtle"
            />
            <input
              id="ph-global-search"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="プロンプトを検索"
              className="h-10 w-56 rounded-md border border-ph-border bg-ph-surface-2 pl-9 pr-3 text-sm text-ph-fg placeholder:text-ph-subtle focus:outline focus:outline-2 focus:outline-ph-accent lg:w-72"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href={`${PROMPTHUB_BASE}/prompts`}
            aria-label="プロンプトを検索"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ph-muted transition-colors hover:bg-ph-surface-2 hover:text-ph-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent md:hidden"
          >
            <Search aria-hidden="true" className="h-[18px] w-[18px]" />
          </Link>
          <ThemeToggle />
          <Button asChild variant="primary" className="ml-1">
            <Link href={`${PROMPTHUB_BASE}/prompts/new`}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">新しいプロンプト</span>
              <span className="sr-only sm:hidden">新しいプロンプトを登録</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
