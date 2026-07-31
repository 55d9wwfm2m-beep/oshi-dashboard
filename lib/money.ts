import { FixedCost } from '@/types';

/** やりくり電卓で使う localStorage キー */
export const MONEY_KEYS = {
  /** 今持っているお金（数字のみの文字列。'' は未入力） */
  balance: 'oshi-money-balance',
  /** 登録された固定費の配列 */
  fixedCosts: 'oshi-money-fixedcosts',
  /** 支払い状況を最後にリセットした月（YYYY-MM） */
  month: 'oshi-money-month',
  /** 給料日（1〜31）。0 は未設定 */
  payday: 'oshi-money-payday',
} as const;

/** 次の給料日まで何日か（今日なら0）。月にない日（31日など）はその月の末日として扱う */
export function paydayDaysLeft(day: number): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const eff = (y: number, m: number) => Math.min(day, new Date(y, m + 1, 0).getDate());
  const y = now.getFullYear();
  const m = now.getMonth();
  let target = new Date(y, m, eff(y, m));
  if (target < now) target = new Date(y, m + 1, eff(y, m + 1));
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

/** やりくり電卓の配色（白・薄いグレー・淡い緑）。推しテーマの --accent とは独立 */
export const MONEY_ACCENT = '#359277';
export const MONEY_ACCENT_BG = 'rgba(53,146,119,0.10)';
export const MONEY_DANGER = '#C4574B';
export const MONEY_DANGER_BG = 'rgba(196,87,75,0.10)';

/** 使っていいお金の残額ステータス（色で一目で分かる表示用） */
export type MoneyStatus = 'safe' | 'warn' | 'tight';

export function statusOf(amount: number): MoneyStatus {
  if (amount >= 30000) return 'safe';
  if (amount >= 10000) return 'warn';
  return 'tight';
}

export const STATUS_META: Record<MoneyStatus, { label: string; color: string; bg: string }> = {
  safe: { label: '安心', color: '#2B7A63', bg: 'rgba(53,146,119,0.10)' },
  warn: { label: '少し注意', color: '#A8770E', bg: 'rgba(168,119,14,0.10)' },
  tight: { label: '節約モード', color: MONEY_DANGER, bg: MONEY_DANGER_BG },
};

/** 全角数字を半角に直し、数字以外と余分な先頭の0を取り除く（最大9桁） */
export function digitsOnly(value: string): string {
  return value
    .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, 9);
}

/** 未払い固定費の合計 */
export function unpaidTotal(costs: FixedCost[]): number {
  return costs.filter(c => !c.paid).reduce((sum, c) => sum + c.amount, 0);
}

/** マイナスも自然に読める円表記（-¥5,000） */
export function formatYenSigned(amount: number): string {
  const abs = Math.abs(amount).toLocaleString('ja-JP');
  return amount < 0 ? `-¥${abs}` : `¥${abs}`;
}

/** 支払日の昇順（同日なら名前順）で並べた新しい配列を返す */
export function sortByPayDay(costs: FixedCost[]): FixedCost[] {
  return [...costs].sort((a, b) => a.payDay - b.payDay || a.name.localeCompare(b.name, 'ja'));
}
