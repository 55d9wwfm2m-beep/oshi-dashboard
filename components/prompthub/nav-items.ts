import {
  Clock,
  FolderTree,
  LayoutDashboard,
  Settings,
  Star,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** 完全一致でのみアクティブにするか */
  exact?: boolean;
}

export const PROMPTHUB_BASE = '/prompthub';

export const NAV_ITEMS: NavItem[] = [
  { href: PROMPTHUB_BASE, label: 'ホーム', icon: LayoutDashboard, exact: true },
  { href: `${PROMPTHUB_BASE}/prompts`, label: 'プロンプト一覧', icon: Sparkles },
  { href: `${PROMPTHUB_BASE}/favorites`, label: 'お気に入り', icon: Star },
  { href: `${PROMPTHUB_BASE}/categories`, label: 'カテゴリー', icon: FolderTree },
  { href: `${PROMPTHUB_BASE}/history`, label: '利用履歴', icon: Clock },
  { href: `${PROMPTHUB_BASE}/settings`, label: '設定', icon: Settings },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
