import { FixedCost, MoneyAccount, MonthlyRecord } from '@/types';
import { generateId } from '@/lib/utils';

/** やりくり電卓で使う localStorage キー */
export const MONEY_KEYS = {
  /** 口座ごとの残高 */
  accounts: 'oshi-money-accounts',
  /** 旧・単一口座時代の所持金。accounts へ引き継いだあとは参照しない */
  balance: 'oshi-money-balance',
  /** 登録された固定費の配列 */
  fixedCosts: 'oshi-money-fixedcosts',
  /** 支払い状況を最後にリセットした月（YYYY-MM） */
  month: 'oshi-money-month',
  /** 給料日（1〜31）。0 は未設定 */
  payday: 'oshi-money-payday',
  /** 月末に自動保存した各月の記録 */
  history: 'oshi-money-history',
} as const;

/** 履歴に残す最大月数（古いものから捨てる） */
export const HISTORY_LIMIT = 24;

/** 「2026年8月」形式 */
export function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-');
  return `${y}年${parseInt(m, 10)}月`;
}

/** 直前の月（YYYY-MM）を返す */
export function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** 新しい月を先頭に、同じ月は上書きして履歴へ追加する */
export function addMonthlyRecord(history: MonthlyRecord[], record: MonthlyRecord): MonthlyRecord[] {
  return [record, ...history.filter(r => r.month !== record.month)]
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, HISTORY_LIMIT);
}

export const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

const holidayCache: Record<number, Record<string, true>> = {};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** その年 y の m 月（0始まり）の第 nth 月曜の日にち */
const nthMonday = (y: number, m: number, nth: number) =>
  1 + ((8 - new Date(y, m, 1).getDay()) % 7) + (nth - 1) * 7;

/** 日本の祝日（振替休日・国民の休日を含む）。1980〜2099年ごろで有効 */
function holidaysOf(year: number): Record<string, true> {
  const cached = holidayCache[year];
  if (cached) return cached;

  const equinox = (base: number) =>
    Math.floor(base + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));

  const base: [number, number][] = [
    [0, 1],                        // 元日
    [0, nthMonday(year, 0, 2)],    // 成人の日
    [1, 11],                       // 建国記念の日
    [1, 23],                       // 天皇誕生日
    [2, equinox(20.8431)],         // 春分の日
    [3, 29],                       // 昭和の日
    [4, 3], [4, 4], [4, 5],        // 憲法記念日・みどりの日・こどもの日
    [6, nthMonday(year, 6, 3)],    // 海の日
    [7, 11],                       // 山の日
    [8, nthMonday(year, 8, 3)],    // 敬老の日
    [8, equinox(23.2488)],         // 秋分の日
    [9, nthMonday(year, 9, 2)],    // スポーツの日
    [10, 3], [10, 23],             // 文化の日・勤労感謝の日
  ];

  const set: Record<string, true> = {};
  base.forEach(([m, d]) => { set[dayKey(new Date(year, m, d))] = true; });

  // 振替休日：日曜と重なった祝日は、その後の最初の平日を休日にする
  base.forEach(([m, d]) => {
    const date = new Date(year, m, d);
    if (date.getDay() !== 0) return;
    do { date.setDate(date.getDate() + 1); } while (set[dayKey(date)]);
    set[dayKey(date)] = true;
  });

  // 国民の休日：祝日と祝日に挟まれた平日も休日になる
  base.forEach(([m, d]) => {
    const date = new Date(year, m, d + 1);
    if (set[dayKey(date)] || date.getDay() === 0) return;
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    if (set[dayKey(next)]) set[dayKey(date)] = true;
  });

  holidayCache[year] = set;
  return set;
}

export function isBusinessDay(d: Date): boolean {
  return d.getDay() !== 0 && d.getDay() !== 6 && !holidaysOf(d.getFullYear())[dayKey(d)];
}

export interface PaydayInfo {
  /** 実際に支給される日 */
  date: Date;
  /** 今日からの日数（今日なら 0） */
  days: number;
  /** 土日・祝日のため前倒しされたか */
  moved: boolean;
}

/**
 * 次の給料日の情報。
 * 月にない日（31日など）はその月の末日として扱い、土日・祝日ならその前の平日へ前倒しする。
 */
export function nextPaydayInfo(day: number): PaydayInfo | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let k = 0; k <= 3; k++) {
    const y = now.getFullYear();
    const m = now.getMonth() + k;
    const raw = new Date(y, m, Math.min(day, new Date(y, m + 1, 0).getDate()));
    const adj = new Date(raw);
    while (!isBusinessDay(adj)) adj.setDate(adj.getDate() - 1);
    if (adj >= now) {
      return {
        date: adj,
        days: Math.round((adj.getTime() - now.getTime()) / 86400000),
        moved: adj.getTime() !== raw.getTime(),
      };
    }
  }
  return null;
}

/** 「8/24（金・前倒し）」形式のラベル */
export function paydayLabel(info: PaydayInfo): string {
  return `${info.date.getMonth() + 1}/${info.date.getDate()}（${WEEKDAY_JA[info.date.getDay()]}${info.moved ? '・前倒し' : ''}）`;
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

/** 口座の金額（未入力は0） */
export function accountAmount(a: MoneyAccount): number {
  return a.amount === '' ? 0 : parseInt(a.amount, 10) || 0;
}

/** 「使っていいお金」の計算に含める口座か（旧データは含める扱い） */
export function isBudgetAccount(a: MoneyAccount): boolean {
  return a.budget !== false;
}

/** 総資産：計算対象かどうかに関わらず、すべての口座の合計 */
export function accountsTotal(accounts: MoneyAccount[]): number {
  return accounts.reduce((s, a) => s + accountAmount(a), 0);
}

/** 予算対象残高：計算対象（ON）の口座だけの合計 */
export function budgetTotal(accounts: MoneyAccount[]): number {
  return accounts.filter(isBudgetAccount).reduce((s, a) => s + accountAmount(a), 0);
}

/**
 * 旧バージョン（単一の所持金）からの引き継ぎ。
 * accounts をまだ一度も保存していないときだけ、以前の金額を「現金」として引き継ぐ。
 * 引き継ぐものがなければ null（＝何もしない）。
 */
export function legacyAccountSeed(): MoneyAccount[] | null {
  try {
    if (window.localStorage.getItem(MONEY_KEYS.accounts) !== null) return null;
    const raw = window.localStorage.getItem(MONEY_KEYS.balance);
    const legacy = raw === null ? '' : digitsOnly(String(JSON.parse(raw) ?? ''));
    return [{ id: generateId(), name: '現金', amount: legacy, budget: true }];
  } catch {
    return null;
  }
}

/** 毎月金額が変わる項目か（既存データは false 扱い） */
export function isVariable(c: FixedCost): boolean {
  return c.variable === true;
}

/** 今月の請求額が確定しているか */
export function hasActual(c: FixedCost): boolean {
  return isVariable(c) && typeof c.actual === 'number';
}

/**
 * 計算に使う金額。
 * 通常の固定費は登録金額、変動費は確定額があればそれ、なければ予想額。
 */
export function effectiveAmount(c: FixedCost): number {
  return hasActual(c) ? (c.actual as number) : c.amount;
}

/** 確定額 − 予想額。確定していなければ null */
export function actualDiff(c: FixedCost): number | null {
  return hasActual(c) ? (c.actual as number) - c.amount : null;
}

/** 未払い固定費の合計（支払い済みは含めない） */
export function unpaidTotal(costs: FixedCost[]): number {
  return costs.filter(c => !c.paid).reduce((sum, c) => sum + effectiveAmount(c), 0);
}

/** 月替わりで確定額と支払い状況だけを初期化する（項目名・予想額・支払日・種類は残す） */
export function resetCostsForNewMonth(costs: FixedCost[]): FixedCost[] {
  return costs.map(c => ({ ...c, paid: false, actual: isVariable(c) ? null : c.actual }));
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
