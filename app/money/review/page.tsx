'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FixedCost, MonthlyBudget, MonthlyRecord, LivingExpense, BudgetCategory } from '@/types';
import { formatYen, getCurrentMonth, formatDateShort } from '@/lib/utils';
import {
  MONEY_KEYS,
  MONEY_ACCENT,
  MONEY_DANGER,
  formatMonthLabel,
  previousMonth,
  effectiveAmount,
  monthOf,
  expensesInMonth,
  totalsByCategory,
  categoryMonthlyAverage,
  buildReview,
  plannedTotal,
  ALERT_MIN_MONTHS,
  ALERT_MIN_DIFF,
  ALERT_MIN_RATIO,
} from '@/lib/money';
import ExpenseSheet from '@/components/ui/ExpenseSheet';
import MoneyTabs from '@/components/ui/MoneyTabs';

const WARN = '#A8770E';
type Range = 'month' | '3m' | 'all';

/** 予算に対して使った割合を示すメーター。トラックが予算、塗りが実績 */
function Meter({ used, budgeted, label }: { used: number; budgeted: number; label: string }) {
  const over = budgeted > 0 && used > budgeted;
  const pct = budgeted > 0 ? Math.min(100, Math.round((used / budgeted) * 100)) : used > 0 ? 100 : 0;
  return (
    <div
      className="h-1.5 rounded mt-2 overflow-hidden"
      style={{ background: '#F0EBE6' }}
      role="img"
      aria-label={`${label} 予算 ${formatYen(budgeted)} のうち ${formatYen(used)} 使用`}
    >
      <div
        className="h-full rounded transition-[width] duration-300"
        style={{ width: `${pct}%`, background: over ? MONEY_DANGER : MONEY_ACCENT }}
      />
    </div>
  );
}

export default function ReviewPage() {
  const [budget] = useLocalStorage<MonthlyBudget | null>(MONEY_KEYS.budget, null);
  const [budgetHistory] = useLocalStorage<MonthlyBudget[]>(MONEY_KEYS.budgetHistory, []);
  const [expenses, setExpenses, expensesLoaded] = useLocalStorage<LivingExpense[]>(MONEY_KEYS.expenses, []);
  const [costs, , costsLoaded] = useLocalStorage<FixedCost[]>(MONEY_KEYS.fixedCosts, []);
  const [history] = useLocalStorage<MonthlyRecord[]>(MONEY_KEYS.history, []);

  const [selected, setSelected] = useState<string | null>(null);
  const [range, setRange] = useState<Range>('month');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<LivingExpense | null>(null);

  if (!expensesLoaded || !costsLoaded) return null;

  const currentMonth = budget?.month ?? getCurrentMonth();

  // 支出か予算のある月を新しい順に
  const months = Array.from(
    new Set([
      ...expenses.map(e => monthOf(e.date)),
      ...budgetHistory.map(b => b.month),
      currentMonth,
    ])
  ).sort((a, b) => b.localeCompare(a)).slice(0, 12);

  const month = selected && months.includes(selected) ? selected : months[0];

  const budgetOf = (m: string): MonthlyBudget | null =>
    m === currentMonth ? budget : budgetHistory.find(b => b.month === m) ?? null;

  /** その月の固定費合計（過去分は月次記録から拾う。無ければ null） */
  const fixedTotalOf = (m: string): number | null => {
    if (m === currentMonth) return costs.reduce((s, c) => s + effectiveAmount(c), 0);
    const rec = history.find(r => r.month === m);
    return rec ? rec.fixedCosts : null;
  };

  const livingOf = (m: string): number => {
    const b = budgetOf(m);
    if (!b) return 0;
    const income = b.income === '' ? 0 : parseInt(b.income, 10) || 0;
    const saving = b.savingGoal === '' ? 0 : parseInt(b.savingGoal, 10) || 0;
    const fixed = fixedTotalOf(m) ?? 0;
    return income - saving - fixed - plannedTotal(b.planned);
  };

  const spentInMonth = (m: string) =>
    expensesInMonth(expenses, m).reduce((s, e) => s + e.amount, 0);

  const monthBudget = budgetOf(month);
  const lines = buildReview(
    month,
    monthBudget,
    expenses,
    livingOf(month),
    fixedTotalOf(month) ?? 0,
    fixedTotalOf(previousMonth(month))
  );

  const spentByCat = totalsByCategory(expensesInMonth(expenses, month));
  const catRows: BudgetCategory[] = (monthBudget?.categories ?? []).filter(
    c => c.amount > 0 || (spentByCat[c.id] || 0) > 0
  );

  // 月次推移（単一系列の縦棒）
  const trend = months.slice(0, 6).reverse().map(m => ({ month: m, value: spentInMonth(m) }));
  const trendMax = Math.max(1, ...trend.map(t => t.value));

  // 期間フィルタ
  const listed = (() => {
    if (range === 'month') return expensesInMonth(expenses, month);
    if (range === '3m') {
      const [y, mo] = month.split('-').map(Number);
      const from = new Date(y, mo - 3, 1);
      const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}`;
      return expenses.filter(e => monthOf(e.date) >= fromStr && monthOf(e.date) <= month);
    }
    return expenses;
  })();
  const listedTotal = listed.reduce((s, e) => s + e.amount, 0);

  const allCategories = budget?.categories ?? [];

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-8 pb-5 anim-fadeIn">
        <Link href="/money" className="inline-flex items-center gap-1 text-xs font-medium py-1 -my-1" style={{ color: '#A8A29E' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          やりくり電卓へ戻る
        </Link>
        <h1 className="text-2xl font-semibold mt-1" style={{ color: '#1C1917' }}>振り返り</h1>
      </div>

      <MoneyTabs />

      {/* 月を選ぶ */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-1 mb-3.5" role="group" aria-label="月を選ぶ">
        {months.map(m => (
          <button
            key={m}
            onClick={() => setSelected(m)}
            aria-pressed={m === month}
            className="shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors"
            style={m === month ? { background: MONEY_ACCENT, color: '#fff' } : { background: '#F0EBE6', color: '#78716C' }}
          >
            {formatMonthLabel(m)}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {/* まとめ */}
        <div className="card p-5 anim-fadeInUp">
          <p className="text-sm font-medium mb-1" style={{ color: '#78716C' }}>
            {formatMonthLabel(month)}のまとめ
          </p>
          {lines.length === 0 ? (
            <p className="text-xs text-center py-2.5" style={{ color: '#A8A29E' }}>
              給料や支出を記録すると、その月の変化をまとめます
            </p>
          ) : (
            lines.map((l, i) => (
              <div
                key={`${l.label}-${i}`}
                className="flex gap-2.5 py-2.5"
                style={{ borderBottom: i === lines.length - 1 ? 'none' : '1px solid rgba(28,18,12,0.06)' }}
              >
                <span className="text-base leading-snug shrink-0" aria-hidden="true">{l.emoji}</span>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: '#1C1917' }}>{l.label}</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: l.tone === 'good' ? MONEY_ACCENT : l.tone === 'warn' ? MONEY_DANGER : '#78716C',
                      fontWeight: l.tone === 'neutral' ? 400 : 600,
                    }}
                  >
                    {l.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* カテゴリー別（メーター） */}
        <div className="card p-5 anim-fadeInUp">
          <p className="text-sm font-medium" style={{ color: '#78716C' }}>生活費の使いみち</p>
          <p className="text-[11px] mb-2" style={{ color: '#A8A29E' }}>バーは予算に対して使った割合です</p>
          {catRows.length === 0 ? (
            <p className="text-xs text-center py-2.5" style={{ color: '#A8A29E' }}>まだ支出の記録がありません</p>
          ) : (
            catRows.map(c => {
              const used = spentByCat[c.id] || 0;
              const over = c.amount > 0 && used > c.amount;
              const avg = categoryMonthlyAverage(expenses, c.id, month);
              const high =
                !over && used > 0 && avg.months >= ALERT_MIN_MONTHS && avg.average > 0 &&
                used - avg.average >= ALERT_MIN_DIFF && used / avg.average >= ALERT_MIN_RATIO;
              return (
                <div key={c.id} className="py-2.5" style={{ borderBottom: '1px solid rgba(28,18,12,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[15px] leading-none shrink-0" aria-hidden="true">{c.emoji}</span>
                    <span className="text-[13.5px] font-semibold truncate" style={{ color: '#1C1917' }}>{c.name}</span>
                  </div>

                  {/* 使った金額は一番読みたい数字なので大きく出す */}
                  <div className="flex items-baseline justify-between gap-2.5 mt-2">
                    <span
                      className="text-[21px] font-bold leading-tight"
                      style={{ color: over ? MONEY_DANGER : '#1C1917', fontVariantNumeric: 'tabular-nums' }}
                    >
                      <small className="text-[11px] font-semibold mr-1.5" style={{ color: '#A8A29E' }}>使った</small>
                      {formatYen(used)}
                    </span>
                    <span className="text-[11.5px] shrink-0" style={{ color: '#A8A29E', fontVariantNumeric: 'tabular-nums' }}>
                      予算 {formatYen(c.amount)}
                    </span>
                  </div>

                  <Meter used={used} budgeted={c.amount} label={c.name} />
                  {over && (
                    <p className="text-[10.5px] mt-1.5 font-bold" style={{ color: MONEY_DANGER }}>
                      ⚠ 予算を {formatYen(used - c.amount)} オーバー
                    </p>
                  )}
                  {high && (
                    <p className="text-[10.5px] mt-1.5 font-bold" style={{ color: WARN }}>
                      📈 普段の月平均 {formatYen(avg.average)} → いつもより約 {formatYen(used - avg.average)} 多め
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 月ごとの生活費（単一系列） */}
        <div className="card p-5 anim-fadeInUp">
          <p className="text-sm font-medium" style={{ color: '#78716C' }}>月ごとの生活費</p>
          <p className="text-[11px] mb-1" style={{ color: '#A8A29E' }}>
            {trend.some(t => t.value > 0) ? '記録した支出の合計です' : 'まだ支出の記録がありません'}
          </p>
          <div className="flex items-end gap-2 h-[132px] pt-1.5">
            {trend.map(t => (
              <div key={t.month} className="flex-1 min-w-0 h-full flex flex-col items-center justify-end">
                {t.value > 0 && (
                  <span className="text-[9.5px] mb-1 whitespace-nowrap" style={{ color: '#78716C', fontVariantNumeric: 'tabular-nums' }}>
                    {formatYen(t.value)}
                  </span>
                )}
                <div
                  className="w-full max-w-[34px] rounded-t"
                  style={{
                    height: Math.max(3, Math.round((t.value / trendMax) * 92)),
                    background: t.month === month ? '#2B7A63' : t.value === 0 ? '#F0EBE6' : MONEY_ACCENT,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="h-px" style={{ background: 'rgba(28,18,12,0.08)' }} aria-hidden="true" />
          <div className="flex gap-2 pt-1.5">
            {trend.map(t => (
              <div key={t.month} className="flex-1 min-w-0 text-center">
                <span className="text-[10px]" style={{ color: '#A8A29E' }}>{parseInt(t.month.split('-')[1], 10)}月</span>
              </div>
            ))}
          </div>
        </div>

        {/* 支出の記録 */}
        <div className="card p-5 anim-fadeInUp">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-medium" style={{ color: '#78716C' }}>支出の記録</p>
            <button
              onClick={() => { setEditing(null); setSheetOpen(true); }}
              className="text-xs font-semibold"
              style={{ color: MONEY_ACCENT }}
            >
              ＋ 記録する
            </button>
          </div>

          <div className="flex gap-1.5 p-1 rounded-2xl mb-3" style={{ background: '#F0EBE6' }} role="group" aria-label="期間を選ぶ">
            {([['month', 'この月'], ['3m', '過去3か月'], ['all', 'すべて']] as [Range, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                aria-pressed={range === key}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                style={range === key
                  ? { background: 'white', color: '#1C1917', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: '#A8A29E' }}
              >
                {label}
              </button>
            ))}
          </div>

          {listed.length === 0 ? (
            <p className="text-xs text-center py-2.5" style={{ color: '#A8A29E' }}>この期間の記録はありません</p>
          ) : (
            <>
              {[...listed].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60).map(e => {
                const c = allCategories.find(x => x.id === e.categoryId);
                return (
                  <button
                    key={e.id}
                    onClick={() => { setEditing(e); setSheetOpen(true); }}
                    className="w-full flex items-center gap-2.5 py-2.5 text-left"
                    style={{ borderBottom: '1px solid rgba(28,18,12,0.06)' }}
                  >
                    <span className="text-[15px] leading-none shrink-0" aria-hidden="true">{c?.emoji ?? '📦'}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-semibold truncate" style={{ color: '#1C1917' }}>
                        {c?.name ?? '（削除されたカテゴリー）'}
                      </span>
                      <span className="block text-[10.5px] mt-0.5" style={{ color: '#A8A29E' }}>
                        {formatDateShort(e.date)}{e.memo && `・${e.memo}`}
                      </span>
                    </span>
                    <span className="text-sm font-bold shrink-0" style={{ color: '#1C1917', fontVariantNumeric: 'tabular-nums' }}>
                      {formatYen(e.amount)}
                    </span>
                  </button>
                );
              })}
              <div className="flex justify-between items-baseline mt-2 pt-2.5" style={{ borderTop: '1px solid rgba(28,18,12,0.06)' }}>
                <span className="text-[12.5px] font-semibold" style={{ color: '#1C1917' }}>この期間の合計</span>
                <span className="text-[17px] font-bold font-serif-num" style={{ color: '#1C1917' }}>{formatYen(listedTotal)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <ExpenseSheet
        open={sheetOpen}
        editing={editing}
        categories={allCategories}
        onClose={() => setSheetOpen(false)}
        onSave={exp => setExpenses(prev =>
          editing ? prev.map(x => (x.id === exp.id ? exp : x)) : [...prev, exp]
        )}
        onDelete={id => setExpenses(prev => prev.filter(x => x.id !== id))}
      />
    </div>
  );
}
