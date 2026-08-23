import {
  FixedCost, MoneyAccount, MonthlyRecord,
  MonthlyBudget, BudgetCategory, PlannedExpense, LivingExpense, DEFAULT_BUDGET_CATEGORIES,
} from '@/types';
import { generateId, formatYen } from '@/lib/utils';

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
  /** 今月の予算計画（給料の振り分け） */
  budget: 'oshi-money-budget',
  /** 過去の月予算の履歴 */
  budgetHistory: 'oshi-money-budget-history',
  /** 生活費の支出記録（全期間を1つの配列で保持） */
  expenses: 'oshi-money-expenses',
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

// ──── 月予算 ────
// 「使っていいお金」（口座残高ベース）とは別の計画用データ。
// 給料は口座残高に一切加算しない（二重計上の防止）。

/** 初期カテゴリー一式を作る */
export function createDefaultCategories(): BudgetCategory[] {
  return DEFAULT_BUDGET_CATEGORIES.map(c => ({
    id: generateId(),
    name: c.name,
    emoji: c.emoji,
    amount: 0,
  }));
}

/** その月の空の予算計画 */
export function createEmptyBudget(month: string, categories?: BudgetCategory[]): MonthlyBudget {
  return {
    month,
    income: '',
    savingGoal: '',
    savedActual: '',
    planned: [],
    categories: categories ?? createDefaultCategories(),
  };
}

export interface SavingResult {
  /** 貯金目標 */
  goal: number;
  /** 実際に貯金できた金額 */
  actual: number;
  /** 実績を入力済みか */
  entered: boolean;
  /** 実績 − 目標（プラスなら目標より多く貯金できた） */
  diff: number;
  /** 目標を達成したか（未入力のときは false） */
  achieved: boolean;
}

/**
 * 貯金の結果。
 * 目標（計画）ではなく、入力された実績で達成を判定する。
 */
export function savingResult(budget: MonthlyBudget): SavingResult {
  const goal = budget.savingGoal === '' ? 0 : parseInt(budget.savingGoal, 10) || 0;
  const raw = budget.savedActual ?? '';
  const entered = raw !== '';
  const actual = entered ? parseInt(raw, 10) || 0 : 0;
  return { goal, actual, entered, diff: actual - goal, achieved: entered && actual >= goal };
}

/** 未払いの予定支出の合計 */
export function plannedUnpaidTotal(planned: PlannedExpense[]): number {
  return planned.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0);
}

/** 予定支出の総額（支払い済みも含む。月予算の「確保」はこちらを使う） */
export function plannedTotal(planned: PlannedExpense[]): number {
  return planned.reduce((s, p) => s + p.amount, 0);
}

/** カテゴリーへ振り分け済みの合計 */
export function allocatedTotal(categories: BudgetCategory[]): number {
  return categories.reduce((s, c) => s + c.amount, 0);
}

export interface BudgetBreakdown {
  income: number;
  saving: number;
  /** 今月の固定費合計（変動費は確定額があればそれ、なければ予想額） */
  fixed: number;
  /** 今月の予定支出合計 */
  planned: number;
  /** 生活費として振り分け可能な金額 */
  living: number;
  /** 振り分け済み */
  allocated: number;
  /** まだ振り分けていないお金（マイナスなら予算オーバー） */
  unallocated: number;
  /** 予算オーバーしている金額（0 なら超過なし） */
  over: number;
}

/**
 * 月予算の内訳を計算する。
 * 給料 − 貯金目標 − 固定費 − 予定支出 ＝ 生活費として振り分け可能な金額
 */
export function budgetBreakdown(budget: MonthlyBudget, costs: FixedCost[]): BudgetBreakdown {
  const income = budget.income === '' ? 0 : parseInt(budget.income, 10) || 0;
  const saving = budget.savingGoal === '' ? 0 : parseInt(budget.savingGoal, 10) || 0;
  const fixed = costs.reduce((s, c) => s + effectiveAmount(c), 0);
  const planned = plannedTotal(budget.planned);
  const living = income - saving - fixed - planned;
  const allocated = allocatedTotal(budget.categories);
  const unallocated = living - allocated;
  return {
    income, saving, fixed, planned, living, allocated,
    unallocated,
    over: unallocated < 0 ? -unallocated : 0,
  };
}

/**
 * 月が変わったときの新しい予算。
 * カテゴリーの構成は引き継ぎ、金額・給料・貯金目標・予定支出はリセットする。
 */
export function rolloverBudget(prev: MonthlyBudget, month: string): MonthlyBudget {
  return {
    month,
    income: '',
    savingGoal: '',
    savedActual: '',
    planned: [],
    categories: prev.categories.map(c => ({ ...c, amount: 0 })),
  };
}

/**
 * 「先月の予算をコピー」。
 * 貯金目標とカテゴリー予算額を引き継ぐ。給料は月ごとに変わるためコピーしない。
 */
export function copyFromBudget(current: MonthlyBudget, source: MonthlyBudget): MonthlyBudget {
  return {
    ...current,
    savingGoal: source.savingGoal,
    // 実際に貯金できた額は「結果」なのでコピーしない
    savedActual: current.savedActual ?? '',
    categories: current.categories.map(c => {
      const prev = source.categories.find(p => p.name === c.name);
      return prev ? { ...c, amount: prev.amount } : c;
    }),
  };
}

// ──── 支出記録と「いつもより高い」の検知 ────

/** 'YYYY-MM-DD' → 'YYYY-MM' */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** from〜to（両端を含む YYYY-MM-DD）の支出。空文字は無制限 */
export function expensesInRange(expenses: LivingExpense[], from: string, to: string): LivingExpense[] {
  return expenses.filter(e => (!from || e.date >= from) && (!to || e.date <= to));
}

/** その月の支出だけを取り出す */
export function expensesInMonth(expenses: LivingExpense[], month: string): LivingExpense[] {
  return expenses.filter(e => monthOf(e.date) === month);
}

/** カテゴリーidごとの合計 */
export function totalsByCategory(expenses: LivingExpense[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of expenses) out[e.categoryId] = (out[e.categoryId] || 0) + e.amount;
  return out;
}

/** 支出のある月を新しい順に並べる */
export function monthsWithExpenses(expenses: LivingExpense[]): string[] {
  return Array.from(new Set(expenses.map(e => monthOf(e.date)))).sort((a, b) => b.localeCompare(a));
}

/**
 * そのカテゴリーの「普段の月平均」。
 * 対象月は除き、そのカテゴリーに支出があった月だけで平均する
 * （使わなかった月を 0 円として混ぜると平均が不当に下がるため）。
 */
export function categoryMonthlyAverage(
  expenses: LivingExpense[],
  categoryId: string,
  excludeMonth: string
): { average: number; months: number } {
  const byMonth: Record<string, number> = {};
  for (const e of expenses) {
    if (e.categoryId !== categoryId) continue;
    const m = monthOf(e.date);
    if (m === excludeMonth) continue;
    byMonth[m] = (byMonth[m] || 0) + e.amount;
  }
  const values = Object.values(byMonth);
  if (values.length === 0) return { average: 0, months: 0 };
  const sum = values.reduce((s, v) => s + v, 0);
  return { average: Math.round(sum / values.length), months: values.length };
}

export interface SpendingAlert {
  category: BudgetCategory;
  /** 今月の支出 */
  current: number;
  /** 普段の月平均 */
  average: number;
  /** 平均をどれだけ超えたか */
  diff: number;
  /** 平均の何倍か */
  ratio: number;
  /** 平均を出すのに使った月数 */
  months: number;
}

/** 平均を出すのに必要な最低月数（1か月だけでは「いつも」と言えない） */
export const ALERT_MIN_MONTHS = 2;
/** これ以上多ければ知らせる（金額と割合の両方を満たしたときだけ） */
export const ALERT_MIN_DIFF = 1000;
export const ALERT_MIN_RATIO = 1.2;

/**
 * 「いつもより明らかに多い」カテゴリーを検出する。
 * 金額差と倍率の両方を満たしたものだけを、超過額の大きい順に返す。
 */
export function spendingAlerts(
  expenses: LivingExpense[],
  categories: BudgetCategory[],
  month: string
): SpendingAlert[] {
  const current = totalsByCategory(expensesInMonth(expenses, month));
  const out: SpendingAlert[] = [];
  for (const category of categories) {
    const spent = current[category.id] || 0;
    if (spent <= 0) continue;
    const { average, months } = categoryMonthlyAverage(expenses, category.id, month);
    if (months < ALERT_MIN_MONTHS || average <= 0) continue;
    const diff = spent - average;
    const ratio = spent / average;
    if (diff >= ALERT_MIN_DIFF && ratio >= ALERT_MIN_RATIO) {
      out.push({ category, current: spent, average, diff, ratio, months });
    }
  }
  return out.sort((a, b) => b.diff - a.diff);
}

// ──── 月のまとめの自動生成 ────

export interface ReviewLine {
  /** 見出し（例：食費） */
  label: string;
  /** 本文（例：予算より ¥4,200 少なかった） */
  text: string;
  /** 良い変化 / 注意したい変化 / ただの事実 */
  tone: 'good' | 'warn' | 'neutral';
  emoji: string;
}

/**
 * その月の「大きな変化」だけを文章にする。
 * 細かい増減は落として、金額の大きいものから数件だけ返す。
 */
export function buildReview(
  month: string,
  budget: MonthlyBudget | null,
  expenses: LivingExpense[],
  /** その月の生活費予算（給料 − 貯金 − 固定費 − 予定支出） */
  living: number,
  fixedTotal: number,
  /** 先月の固定費合計。比較できないときは null */
  prevFixedTotal: number | null
): ReviewLine[] {
  const lines: ReviewLine[] = [];
  if (!budget) return lines;

  // 予定支出（大きいものから2件まで）
  [...budget.planned]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 2)
    .filter(p => p.amount > 0)
    .forEach(p => {
      lines.push({
        label: p.name,
        text: `予定支出 ${formatYen(p.amount)}`,
        tone: 'neutral',
        emoji: '📌',
      });
    });

  // カテゴリーごとの 予算 vs 実績（差が大きい順に3件まで）
  const spent = totalsByCategory(expensesInMonth(expenses, month));
  const diffs = budget.categories
    .map(c => ({ c, budgeted: c.amount, actual: spent[c.id] || 0 }))
    .filter(x => x.budgeted > 0 || x.actual > 0)
    .map(x => ({ ...x, diff: x.actual - x.budgeted }))
    .filter(x => Math.abs(x.diff) >= 1000)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 3);

  diffs.forEach(({ c, diff }) => {
    lines.push({
      label: c.name,
      text: diff < 0
        ? `予算より ${formatYen(-diff)} 少なかった`
        : `予算より ${formatYen(diff)} 多かった`,
      tone: diff < 0 ? 'good' : 'warn',
      emoji: c.emoji,
    });
  });

  // 固定費の増減
  if (prevFixedTotal !== null && Math.abs(fixedTotal - prevFixedTotal) >= 500) {
    const d = fixedTotal - prevFixedTotal;
    lines.push({
      label: '固定費',
      text: d < 0 ? `先月より ${formatYen(-d)} 減少` : `先月より ${formatYen(d)} 増加`,
      tone: d < 0 ? 'good' : 'warn',
      emoji: '🏠',
    });
  }

  // 生活費が予算に収まったか
  const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0);
  if (totalSpent > 0 && living > 0) {
    const over = totalSpent - living;
    lines.push({
      label: '生活費',
      text: over <= 0
        ? `予算内におさまりました（残り ${formatYen(-over)}）`
        : `予算を ${formatYen(over)} 超えました`,
      tone: over <= 0 ? 'good' : 'warn',
      emoji: '🧮',
    });
  }

  // 貯金は「実際に貯金できた額」で判定する（目標だけでは達成とは言えない）
  const s = savingResult(budget);
  if (s.goal > 0 || s.entered) {
    if (!s.entered) {
      lines.push({
        label: '貯金',
        text: `目標 ${formatYen(s.goal)}。実際に貯金できた額を入力すると結果が出ます`,
        tone: 'neutral',
        emoji: '🐖',
      });
    } else if (s.diff > 0) {
      lines.push({
        label: '結果',
        text: `貯金 ${formatYen(s.actual)}。目標より ${formatYen(s.diff)} 多く貯金できました 🎉`,
        tone: 'good',
        emoji: '🎉',
      });
    } else if (s.diff === 0) {
      lines.push({
        label: '結果',
        text: `貯金目標 ${formatYen(s.goal)} を達成 🎉`,
        tone: 'good',
        emoji: '🎉',
      });
    } else {
      lines.push({
        label: '結果',
        text: s.actual === 0
          ? `今月は貯金できませんでした（目標 ${formatYen(s.goal)}）`
          : `貯金 ${formatYen(s.actual)}。目標より ${formatYen(-s.diff)} 少なかった`,
        tone: 'warn',
        emoji: '💪',
      });
    }
  }

  return lines;
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
