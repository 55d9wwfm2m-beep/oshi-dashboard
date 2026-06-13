import type { OshiProfile, OshiEvent, AttendanceLog, Expense, Savings, GameState } from '@/types';
import { daysSince } from './utils';

// ──── XP報酬 ────
export const XP_REWARDS = {
  EVENT_CREATE:    50,
  LOG_CREATE:     100,
  EXPENSE_CREATE:  20,
  SAVINGS_UPDATE:  10,
  PROFILE_SET:     50,
  DAILY_LOGIN:      5,
} as const;

// ──── レベル計算 ────
function xpNeededForLevelUp(level: number): number {
  return level * 30 + 70;
}

export function xpForLevel(n: number): number {
  if (n <= 1) return 0;
  let total = 0;
  for (let i = 1; i < n; i++) total += xpNeededForLevelUp(i);
  return total;
}

export function getLevelFromXP(xp: number): number {
  let lv = 1;
  while (lv < 99 && xp >= xpForLevel(lv + 1)) lv++;
  return lv;
}

export function getXPProgress(xp: number): {
  level: number;
  current: number;
  needed: number;
  pct: number;
} {
  const level = getLevelFromXP(xp);
  const start  = xpForLevel(level);
  const end    = xpForLevel(level + 1);
  const current = xp - start;
  const needed  = end - start;
  return { level, current, needed, pct: Math.round((current / needed) * 100) };
}

// ──── レベル称号 ────
export const LEVEL_TIERS = [
  { min:  1, title: '推しビギナー',       char: '🌱', bg: 'linear-gradient(135deg,#faf8f6,#f0ebe6)', solidBg: '#FAF8F6' },
  { min:  5, title: 'ペンライトデビュー',  char: '🌸', bg: 'linear-gradient(135deg,#fde8ee,#fce7e1)', solidBg: '#FDE8EE' },
  { min: 10, title: '現場の常連',         char: '⭐', bg: 'linear-gradient(135deg,#e8eefb,#dde6fa)', solidBg: '#E8EEFB' },
  { min: 15, title: '推し活マスター',      char: '🌙', bg: 'linear-gradient(135deg,#ede8fb,#e4dcfa)', solidBg: '#EDE8FB' },
  { min: 20, title: 'ベテランファン',      char: '🔥', bg: 'linear-gradient(135deg,#fbf0e1,#fae8d0)', solidBg: '#FBF0E1' },
  { min: 30, title: 'レジェンドファン',    char: '✨', bg: 'linear-gradient(135deg,#fffbe1,#fef5cc)', solidBg: '#FFFBE1' },
  { min: 50, title: '推し活の神',         char: '🌟', bg: 'linear-gradient(135deg,#f8f4e8,#f4eece)', solidBg: '#F8F4E8' },
];

export function getLevelTier(level: number) {
  return [...LEVEL_TIERS].reverse().find(t => level >= t.min) ?? LEVEL_TIERS[0];
}

// ──── アバターアイテム ────
export const AVATAR_ITEMS = [
  { id: 'penlight', name: 'ペンライト',         emoji: '🪄', unlockLevel:  5 },
  { id: 'shirt',    name: 'ライブTシャツ',       emoji: '👕', unlockLevel: 10 },
  { id: 'gem',      name: '推しカラーアクセ',     emoji: '💎', unlockLevel: 15 },
  { id: 'uchiwa',   name: 'うちわ',             emoji: '🪭', unlockLevel: 20 },
  { id: 'bag',      name: '遠征バッグ',           emoji: '🎒', unlockLevel: 25 },
  { id: 'crown',    name: '王冠・特別衣装',       emoji: '👑', unlockLevel: 30 },
];

// ──── 実績定義 ────
export type Rarity = 'bronze' | 'silver' | 'gold';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  rarity: Rarity;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'profile_set',    name: '推しとの出会い',     desc: 'プロフィールを登録した',            icon: '⭐', rarity: 'bronze' },
  { id: 'first_event',    name: '現場デビュー',       desc: '初めてイベントを登録した',           icon: '🎵', rarity: 'bronze' },
  { id: 'first_log',      name: '初参戦',             desc: '初めて参戦ログを作成した',           icon: '📸', rarity: 'bronze' },
  { id: 'first_savings',  name: '夢への一歩',         desc: '推し活貯金を開始した',              icon: '💰', rarity: 'bronze' },
  { id: 'events_5',       name: 'ライブ常連',         desc: 'イベントを5件登録した',             icon: '🎤', rarity: 'silver' },
  { id: 'log_10',         name: '思い出コレクター',    desc: '参戦ログを10件作成した',            icon: '📚', rarity: 'silver' },
  { id: 'expedition_5',   name: '遠征マスター',       desc: '遠征を5回記録した',                icon: '🚄', rarity: 'silver' },
  { id: 'days_30',        name: '推し活1ヶ月',        desc: '推しと出会って30日が経った',         icon: '🗓', rarity: 'bronze' },
  { id: 'days_100',       name: '推し活100日',        desc: '推しと出会って100日が経った',        icon: '🏅', rarity: 'silver' },
  { id: 'days_365',       name: '推し活1周年',        desc: '推しと出会って1年が経った',          icon: '🎊', rarity: 'gold'   },
  { id: 'expense_30',     name: 'グッズ収集家',       desc: '支出を30件記録した',               icon: '🛍️', rarity: 'silver' },
  { id: 'log_50',         name: 'レポ職人',           desc: '参戦ログを50件作成した',            icon: '✍️', rarity: 'gold'   },
  { id: 'savings_goal',   name: '夢を叶えた',         desc: '推し活貯金の目標を達成した',         icon: '🎯', rarity: 'gold'   },
  { id: 'level_5',        name: 'ペンライト解放',     desc: 'Lv.5に到達した',                  icon: '🪄', rarity: 'bronze' },
  { id: 'level_10',       name: '現場の人',           desc: 'Lv.10に到達した',                 icon: '🔥', rarity: 'silver' },
  { id: 'level_20',       name: 'うちわ解放',         desc: 'Lv.20に到達した',                 icon: '🪭', rarity: 'silver' },
  { id: 'level_25',       name: '遠征バッグ解放',     desc: 'Lv.25に到達した',                 icon: '🎒', rarity: 'gold'   },
  { id: 'level_30',       name: 'レジェンド認定',     desc: 'Lv.30に到達した（王冠・特別衣装）',  icon: '👑', rarity: 'gold'   },
];

export const RARITY_STYLE: Record<Rarity, { label: string; color: string; bg: string; border: string }> = {
  bronze:   { label: 'ブロンズ', color: '#A0856B', bg: 'rgba(160,133,107,0.1)', border: 'rgba(160,133,107,0.25)' },
  silver:   { label: 'シルバー', color: '#8E9099', bg: 'rgba(142,144,153,0.1)', border: 'rgba(142,144,153,0.25)' },
  gold:     { label: 'ゴールド', color: '#B5913A', bg: 'rgba(181,145,58,0.1)',  border: 'rgba(181,145,58,0.3)'  },
};

// ──── 実績チェック ────
export interface CheckData {
  profile: OshiProfile;
  events: OshiEvent[];
  logs: AttendanceLog[];
  expenses: Expense[];
  savings: Savings;
  gameState: GameState;
}

export function checkAchievement(id: string, d: CheckData): boolean {
  switch (id) {
    case 'profile_set':   return !!d.profile.name;
    case 'first_event':   return d.events.length >= 1;
    case 'first_log':     return d.logs.length >= 1;
    case 'first_savings': return d.savings.goal > 0;
    case 'events_5':      return d.events.length >= 5;
    case 'log_10':        return d.logs.length >= 10;
    case 'log_50':        return d.logs.length >= 50;
    case 'expedition_5':  return d.expenses.filter(e => e.category === '遠征').length >= 5;
    case 'days_30':       return !!d.profile.meetDate && daysSince(d.profile.meetDate) >= 30;
    case 'days_100':      return !!d.profile.meetDate && daysSince(d.profile.meetDate) >= 100;
    case 'days_365':      return !!d.profile.meetDate && daysSince(d.profile.meetDate) >= 365;
    case 'expense_30':    return d.expenses.length >= 30;
    case 'savings_goal':  return d.savings.goal > 0 && d.savings.current >= d.savings.goal;
    case 'level_5':       return d.gameState.level >= 5;
    case 'level_10':      return d.gameState.level >= 10;
    case 'level_20':      return d.gameState.level >= 20;
    case 'level_25':      return d.gameState.level >= 25;
    case 'level_30':      return d.gameState.level >= 30;
    default:              return false;
  }
}
