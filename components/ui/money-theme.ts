import { STATUS_META as originalStatus } from '@/lib/money';
// 計算・判定とは独立した表示用トークン。元の日本語ラベルを維持する。
export const MONEY_ACCENT = 'var(--accent, #359277)';
export const MONEY_ACCENT_BG = 'var(--accent-soft, rgba(53,146,119,.1))';
export const MONEY_DANGER = 'var(--danger, #C4574B)';
export const MONEY_DANGER_BG = 'var(--danger-soft, rgba(196,87,75,.1))';
export const STATUS_META = {
  safe: { ...originalStatus.safe, color: 'var(--safe)', bg: MONEY_ACCENT_BG },
  warn: { ...originalStatus.warn, color: 'var(--warn)', bg: 'var(--warn-soft)' },
  tight: { ...originalStatus.tight, color: MONEY_DANGER, bg: MONEY_DANGER_BG },
};
