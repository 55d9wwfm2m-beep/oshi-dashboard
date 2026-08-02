import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind のクラス衝突を解決しつつ結合する */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createId(prefix = 'p'): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

const DATE_FORMAT = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

const DATETIME_FORMAT = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return DATE_FORMAT.format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return DATETIME_FORMAT.format(date);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** 「3日前」のような相対表記。7日以上前は日付表記へフォールバックする。 */
export function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const diff = Date.now() - date.getTime();
  if (diff < MINUTE) return 'たった今';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}分前`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}時間前`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}日前`;
  return formatDate(iso);
}

export function isSameMonth(iso: string, base = new Date()): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === base.getFullYear() && date.getMonth() === base.getMonth();
}

/** 全角・半角と大文字小文字の差を吸収した検索用キー */
export function normalizeForSearch(value: string): string {
  return value.normalize('NFKC').toLowerCase().trim();
}

export function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}

/** 「AI, 要約 , ,顧客対応」のような入力をタグ配列へ整形する */
export function parseTags(value: string, max: number): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,、\s]+/)
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean)
    )
  ).slice(0, max);
}
