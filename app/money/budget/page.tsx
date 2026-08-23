'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FixedCost, MonthlyBudget, PlannedExpense, BudgetCategory, LivingExpense } from '@/types';
import { formatYen, getCurrentMonth, generateId, formatDateShort } from '@/lib/utils';
import {
  MONEY_KEYS,
  MONEY_ACCENT,
  MONEY_ACCENT_BG,
  MONEY_DANGER,
  MONEY_DANGER_BG,
  digitsOnly,
  formatYenSigned,
  formatMonthLabel,
  budgetBreakdown,
  createEmptyBudget,
  copyFromBudget,
  effectiveAmount,
  isVariable,
  hasActual,
  plannedTotal,
  savingResult,
  expensesInMonth,
  totalsByCategory,
  categoryMonthlyAverage,
  ALERT_MIN_MONTHS,
  ALERT_MIN_DIFF,
  ALERT_MIN_RATIO,
} from '@/lib/money';
import BottomSheet from '@/components/ui/BottomSheet';
import ExpenseSheet from '@/components/ui/ExpenseSheet';
import { showToast } from '@/components/ui/Toast';
import MoneyTabs from '@/components/ui/MoneyTabs';

const WARN = '#A8770E';

/** 手順の見出し（1 給料 → 2 貯金 → 3 固定費 → 4 予定支出 → 5 生活費） */
function StepHead({ no, label, action }: { no: number; label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: MONEY_ACCENT }}
      >
        {no}
      </span>
      <p className="text-[13.5px] font-bold" style={{ color: '#1C1917' }}>{label}</p>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

const Arrow = () => (
  <div className="text-center text-[15px] leading-none -mt-1.5 mb-2" style={{ color: '#A8A29E' }} aria-hidden="true">↓</div>
);

export default function BudgetPage() {
  const [budget, setBudget, budgetLoaded] = useLocalStorage<MonthlyBudget | null>(MONEY_KEYS.budget, null);
  const [budgetHistory, setBudgetHistory, historyLoaded] = useLocalStorage<MonthlyBudget[]>(MONEY_KEYS.budgetHistory, []);
  const [costs, , costsLoaded] = useLocalStorage<FixedCost[]>(MONEY_KEYS.fixedCosts, []);
  const [expenses, setExpenses, expensesLoaded] = useLocalStorage<LivingExpense[]>(MONEY_KEYS.expenses, []);
  const [expenseSheet, setExpenseSheet] = useState(false);

  const [plannedTarget, setPlannedTarget] = useState<PlannedExpense | null>(null);
  const [plannedNew, setPlannedNew] = useState(false);
  const [pName, setPName] = useState('');
  const [pAmount, setPAmount] = useState('');
  const [pDate, setPDate] = useState('');

  const [catTarget, setCatTarget] = useState<BudgetCategory | null>(null);
  const [catNew, setCatNew] = useState(false);
  const [cName, setCName] = useState('');
  const [cEmoji, setCEmoji] = useState('📦');

  // 月予算の初期化・繰り越し（前月分は履歴に残す）
  useEffect(() => {
    if (!budgetLoaded || !historyLoaded) return;
    const now = getCurrentMonth();
    if (!budget) {
      setBudget(createEmptyBudget(now));
      return;
    }
    if (budget.month !== now) {
      setBudgetHistory(prev =>
        [budget, ...prev.filter(b => b.month !== budget.month)]
          .sort((a, b) => b.month.localeCompare(a.month))
          .slice(0, 24)
      );
      setBudget(createEmptyBudget(now, budget.categories.map(c => ({ ...c, amount: 0 }))));
    }
  }, [budgetLoaded, historyLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!budgetLoaded || !historyLoaded || !costsLoaded || !expensesLoaded || !budget) return null;

  const b = budgetBreakdown(budget, costs);
  // 貯金は目標（計画）ではなく、入力された実績で判定する
  const saving = savingResult(budget);
  const spentByCat = totalsByCategory(expensesInMonth(expenses, budget.month));
  const sortedCosts = [...costs].sort((a, c) => a.payDay - c.payDay || a.name.localeCompare(c.name, 'ja'));
  const sortedPlanned = [...budget.planned].sort((x, y) => (x.date || '9999').localeCompare(y.date || '9999'));

  const update = (patch: Partial<MonthlyBudget>) => setBudget(prev => (prev ? { ...prev, ...patch } : prev));

  /* 予定支出 */
  const openPlanned = (item: PlannedExpense | null) => {
    setPlannedTarget(item);
    setPlannedNew(item === null);
    setPName(item?.name ?? '');
    setPAmount(item ? String(item.amount) : '');
    setPDate(item?.date ?? '');
  };
  const closePlanned = () => { setPlannedTarget(null); setPlannedNew(false); };
  const pAmountValue = pAmount === '' ? 0 : parseInt(pAmount, 10) || 0;
  const savePlanned = () => {
    const name = pName.trim();
    if (!name || pAmountValue <= 0) { showToast('内容と金額を入力してください'); return; }
    if (plannedTarget) {
      update({
        planned: budget.planned.map(p =>
          p.id === plannedTarget.id ? { ...p, name, amount: pAmountValue, date: pDate } : p
        ),
      });
      showToast('予定支出を更新しました');
    } else {
      update({ planned: [...budget.planned, { id: generateId(), name, amount: pAmountValue, date: pDate, paid: false }] });
      showToast('予定支出を追加しました');
    }
    closePlanned();
  };
  const deletePlanned = () => {
    if (!plannedTarget) return;
    update({ planned: budget.planned.filter(p => p.id !== plannedTarget.id) });
    closePlanned();
    showToast('予定支出を削除しました');
  };

  /* カテゴリー */
  const openCat = (cat: BudgetCategory | null) => {
    setCatTarget(cat);
    setCatNew(cat === null);
    setCName(cat?.name ?? '');
    setCEmoji(cat?.emoji ?? '📦');
  };
  const closeCat = () => { setCatTarget(null); setCatNew(false); };
  const saveCat = () => {
    const name = cName.trim();
    if (!name) { showToast('カテゴリー名を入力してください'); return; }
    const emoji = cEmoji.trim() || '📦';
    if (catTarget) {
      update({ categories: budget.categories.map(c => (c.id === catTarget.id ? { ...c, name, emoji } : c)) });
      showToast('カテゴリーを更新しました');
    } else {
      update({ categories: [...budget.categories, { id: generateId(), name, emoji, amount: 0 }] });
      showToast('カテゴリーを追加しました');
    }
    closeCat();
  };
  const deleteCat = () => {
    if (!catTarget) return;
    update({ categories: budget.categories.filter(c => c.id !== catTarget.id) });
    closeCat();
    showToast('カテゴリーを削除しました');
  };

  /* 先月をコピー（給料は月ごとに変わるためコピーしない） */
  const copyLastMonth = () => {
    const src = budgetHistory[0];
    if (!src) return;
    setBudget(prev => (prev ? copyFromBudget(prev, src) : prev));
    showToast('先月の貯金目標と振り分けをコピーしました。給料は入力してください');
  };

  const moneyInput = (value: string, onChange: (raw: string) => void, placeholder: string, id: string) => (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value === '' ? '' : (parseInt(value, 10) || 0).toLocaleString('ja-JP')}
        onChange={e => onChange(digitsOnly(e.target.value))}
        placeholder={placeholder}
        className="input pl-8"
        style={{ fontSize: 18, fontWeight: 600 }}
      />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-8 pb-5 flex items-end justify-between">
        <div className="anim-fadeIn">
          <Link href="/money" className="inline-flex items-center gap-1 text-xs font-medium py-1 -my-1" style={{ color: '#A8A29E' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            やりくり電卓へ戻る
          </Link>
          <h1 className="text-2xl font-semibold mt-1" style={{ color: '#1C1917' }}>
            {formatMonthLabel(budget.month)}の予算
          </h1>
        </div>
        {budgetHistory.length > 0 && (
          <button
            onClick={copyLastMonth}
            className="text-xs font-medium px-4 py-2.5 rounded-full active:scale-95 transition-transform anim-fadeIn"
            style={{ background: MONEY_ACCENT_BG, color: MONEY_ACCENT }}
          >
            先月をコピー
          </button>
        )}
      </div>

      <MoneyTabs />

      <div className="px-4">
        {/* STEP 1 給料 */}
        <div className="card p-5 anim-fadeInUp">
          <StepHead no={1} label="今月もらった給料" />
          {moneyInput(budget.income, raw => update({ income: raw }), '250,000', 'budget-income')}
        </div>
        <Arrow />

        {/* STEP 2 貯金（目標と、実際に貯金できた額） */}
        <div className="card p-5 anim-fadeInUp">
          <StepHead no={2} label="今月の貯金" />

          <label className="field-label" htmlFor="budget-saving">目標</label>
          {moneyInput(budget.savingGoal, raw => update({ savingGoal: raw }), '30,000', 'budget-saving')}
          <p className="text-[11px] mt-2" style={{ color: '#A8A29E' }}>
            {b.income > 0 ? `貯金を引いた残り ${formatYenSigned(b.income - b.saving)}` : '給料を入力すると残りが表示されます'}
          </p>

          <label className="field-label mt-3.5" htmlFor="budget-saved">実際に貯金できた額</label>
          {moneyInput(budget.savedActual ?? '', raw => update({ savedActual: raw }), '月末に入力', 'budget-saved')}
          <p
            className="text-[11px] mt-2"
            style={{
              color: !saving.entered ? '#A8A29E' : saving.diff >= 0 ? MONEY_ACCENT : MONEY_DANGER,
              fontWeight: saving.entered ? 600 : 400,
            }}
          >
            {!saving.entered
              ? (saving.goal > 0 ? '月末に入力すると、目標を達成できたか分かります' : '実際に貯金できた額を入力できます')
              : saving.diff > 0
                ? `🎉 目標より ${formatYen(saving.diff)} 多く貯金できました`
                : saving.diff === 0
                  ? '🎉 貯金目標を達成しました'
                  : `目標より ${formatYen(-saving.diff)} 少なめです`}
          </p>
        </div>
        <Arrow />

        {/* STEP 3 固定費（自動反映） */}
        <div className="card p-5 anim-fadeInUp">
          <StepHead
            no={3}
            label="固定費"
            action={<Link href="/money/settings" className="text-xs font-medium" style={{ color: MONEY_ACCENT }}>編集</Link>}
          />
          {costs.length === 0 ? (
            <p className="text-xs text-center py-2.5" style={{ color: '#A8A29E' }}>固定費が登録されていません</p>
          ) : (
            <>
              {sortedCosts.map(c => (
                <div key={c.id} className="flex justify-between items-baseline py-1.5">
                  <span className="text-[12.5px] truncate" style={{ color: '#78716C' }}>
                    {isVariable(c) && '⚡ '}{c.name}
                    {isVariable(c) && (hasActual(c) ? '（確定）' : '（予想）')}
                  </span>
                  <span className="text-[13px] font-semibold shrink-0 ml-3" style={{ color: '#1C1917', fontVariantNumeric: 'tabular-nums' }}>
                    {formatYen(effectiveAmount(c))}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-baseline mt-2 pt-2.5" style={{ borderTop: '1px solid rgba(28,18,12,0.06)' }}>
                <span className="text-[12.5px] font-semibold" style={{ color: '#1C1917' }}>固定費合計</span>
                <span className="text-[17px] font-bold font-serif-num" style={{ color: '#1C1917' }}>{formatYen(b.fixed)}</span>
              </div>
            </>
          )}
        </div>
        <Arrow />

        {/* STEP 4 予定支出 */}
        <div className="card p-5 anim-fadeInUp">
          <StepHead
            no={4}
            label="今月の予定支出"
            action={
              <button onClick={() => openPlanned(null)} className="text-xs font-semibold" style={{ color: MONEY_ACCENT }}>
                ＋ 追加
              </button>
            }
          />
          {budget.planned.length === 0 ? (
            <p className="text-xs text-center py-2.5 leading-relaxed" style={{ color: '#A8A29E' }}>
              旅行や美容院など、その月だけの出費を登録できます
            </p>
          ) : (
            <>
              {sortedPlanned.map(p => (
                <button
                  key={p.id}
                  onClick={() => openPlanned(p)}
                  className="w-full flex justify-between items-baseline py-1.5 text-left"
                >
                  <span
                    className="text-[12.5px] truncate"
                    style={{ color: '#78716C', textDecoration: p.paid ? 'line-through' : 'none', opacity: p.paid ? 0.6 : 1 }}
                  >
                    {p.name} <span className="text-[11px]" style={{ color: '#A8A29E' }}>{p.date ? formatDateShort(p.date) : '日付未定'}</span>
                    {p.paid && (
                      <span className="ml-1.5 text-[9.5px] font-bold px-1.5 py-[2px] rounded-full align-middle"
                        style={{ background: MONEY_ACCENT_BG, color: MONEY_ACCENT }}>
                        支払い済み
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] font-semibold shrink-0 ml-3" style={{ color: '#1C1917', fontVariantNumeric: 'tabular-nums' }}>
                    {formatYen(p.amount)}
                  </span>
                </button>
              ))}
              <div className="flex justify-between items-baseline mt-2 pt-2.5" style={{ borderTop: '1px solid rgba(28,18,12,0.06)' }}>
                <span className="text-[12.5px] font-semibold" style={{ color: '#1C1917' }}>予定支出合計</span>
                <span className="text-[17px] font-bold font-serif-num" style={{ color: '#1C1917' }}>
                  {formatYen(plannedTotal(budget.planned))}
                </span>
              </div>
            </>
          )}
        </div>
        <Arrow />

        {/* STEP 5 生活費の振り分け */}
        <div className="card p-5 pb-5 anim-fadeInUp">
          <StepHead
            no={5}
            label="生活費に振り分け"
            action={
              <button onClick={() => openCat(null)} className="text-xs font-semibold" style={{ color: MONEY_ACCENT }}>
                ＋ カテゴリー
              </button>
            }
          />

          <div
            className="text-center rounded-[18px] px-3 py-4 mb-4"
            style={{
              background: `linear-gradient(165deg, ${b.living < 0 ? MONEY_DANGER_BG : MONEY_ACCENT_BG}, transparent 85%)`,
            }}
          >
            <p className="text-[11.5px] font-semibold tracking-wider" style={{ color: '#78716C' }}>
              生活費として振り分け可能
            </p>
            <p
              className="text-[32px] leading-tight font-semibold font-serif-num mt-0.5"
              style={{ color: b.living < 0 ? MONEY_DANGER : MONEY_ACCENT }}
            >
              {formatYenSigned(b.living)}
            </p>
          </div>

          {budget.categories.map(c => {
            const used = spentByCat[c.id] || 0;
            const over = c.amount > 0 && used > c.amount;
            const pct = c.amount > 0 ? Math.min(100, Math.round((used / c.amount) * 100)) : used > 0 ? 100 : 0;
            const avg = categoryMonthlyAverage(expenses, c.id, budget.month);
            const high =
              !over && used > 0 && avg.months >= ALERT_MIN_MONTHS && avg.average > 0 &&
              used - avg.average >= ALERT_MIN_DIFF && used / avg.average >= ALERT_MIN_RATIO;

            return (
              <div key={c.id} className="py-2.5" style={{ borderBottom: '1px solid rgba(28,18,12,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-[15px] leading-none shrink-0" aria-hidden="true">{c.emoji}</span>
                  <label htmlFor={`cat-${c.id}`} className="text-[13.5px] font-semibold truncate" style={{ color: '#1C1917' }}>
                    {c.name}
                  </label>
                  <button
                    onClick={() => openCat(c)}
                    className="text-[15px] px-1 shrink-0"
                    style={{ color: '#A8A29E' }}
                    aria-label={`${c.name}を編集`}
                  >
                    ⚙
                  </button>
                  <div className="relative w-[46%] max-w-[150px] shrink-0 ml-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
                    <input
                      id={`cat-${c.id}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={c.amount ? c.amount.toLocaleString('ja-JP') : ''}
                      onChange={e => {
                        const raw = digitsOnly(e.target.value);
                        update({
                          categories: budget.categories.map(x =>
                            x.id === c.id ? { ...x, amount: raw === '' ? 0 : parseInt(raw, 10) || 0 } : x
                          ),
                        });
                      }}
                      placeholder="0"
                      className="input text-right font-semibold"
                      style={{ padding: '10px 12px 10px 28px', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                </div>

                {/* トラックが予算、塗りが実績 */}
                <div
                  className="h-1.5 rounded mt-2 overflow-hidden"
                  style={{ background: '#F0EBE6' }}
                  role="img"
                  aria-label={`${c.name} 予算 ${formatYen(c.amount)} のうち ${formatYen(used)} 使用`}
                >
                  <div
                    className="h-full rounded transition-[width] duration-300"
                    style={{ width: `${pct}%`, background: over ? MONEY_DANGER : MONEY_ACCENT }}
                  />
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
                    {over ? `予算 ${formatYen(c.amount)}` : `残り ${formatYen(Math.max(0, c.amount - used))}`}
                  </span>
                </div>

                {over && (
                  <p className="text-[11px] mt-1 font-bold" style={{ color: MONEY_DANGER }}>
                    ⚠ 予算を {formatYen(used - c.amount)} オーバー
                  </p>
                )}
                {high && (
                  <p className="text-[11px] mt-1 font-bold" style={{ color: WARN }}>
                    📈 いつもより約 {formatYen(used - avg.average)} 多め
                  </p>
                )}
              </div>
            );
          })}

          <button
            id="budget-log"
            onClick={() => setExpenseSheet(true)}
            className="w-full rounded-2xl py-3 mt-3.5 text-[13px] font-bold"
            style={{ border: '1.5px dashed rgba(28,18,12,0.12)', color: MONEY_ACCENT }}
          >
            ＋ 使ったお金を記録する
          </button>

          <div className="mt-3.5 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(28,18,12,0.06)' }}>
            <div className="flex justify-between items-baseline">
              <span className="text-[12.5px]" style={{ color: '#78716C' }}>振り分け済み</span>
              <span className="text-[15px] font-bold" style={{ color: '#1C1917', fontVariantNumeric: 'tabular-nums' }}>
                {formatYen(b.allocated)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[12.5px] font-semibold" style={{ color: '#1C1917' }}>まだ振り分けていないお金</span>
              <span
                className="text-[19px] font-bold"
                style={{ color: b.unallocated < 0 ? MONEY_DANGER : MONEY_ACCENT, fontVariantNumeric: 'tabular-nums' }}
              >
                {formatYenSigned(b.unallocated)}
              </span>
            </div>
            {b.over > 0 && (
              <div
                className="mt-2.5 px-3.5 py-2.5 rounded-2xl text-center text-[12.5px] font-bold"
                style={{ background: MONEY_DANGER_BG, color: MONEY_DANGER }}
              >
                予算を {formatYen(b.over)} オーバーしています
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 予定支出の追加・編集 */}
      <BottomSheet
        open={plannedTarget !== null || plannedNew}
        onClose={closePlanned}
        title={plannedTarget ? '予定支出を編集' : '予定支出を追加'}
      >
        <div className="space-y-4">
          <div>
            <label className="field-label" htmlFor="planned-name">内容 *</label>
            <input id="planned-name" type="text" value={pName} onChange={e => setPName(e.target.value)}
              placeholder="例：福岡旅行・美容院" className="input" />
          </div>
          <div>
            <label className="field-label" htmlFor="planned-amount">金額 *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
              <input id="planned-amount" type="text" inputMode="numeric" autoComplete="off"
                value={pAmount === '' ? '' : pAmountValue.toLocaleString('ja-JP')}
                onChange={e => setPAmount(digitsOnly(e.target.value))}
                placeholder="30,000" className="input pl-8" />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="planned-date">予定日</label>
            <input id="planned-date" type="date" value={pDate} onChange={e => setPDate(e.target.value)} className="input" />
          </div>
          {plannedTarget && (
            <button
              onClick={() => update({
                planned: budget.planned.map(p => (p.id === plannedTarget.id ? { ...p, paid: !p.paid } : p)),
              })}
              className="w-full py-3 rounded-2xl text-sm font-medium"
              style={{ background: '#F0EBE6', color: '#78716C' }}
            >
              {plannedTarget.paid ? '未払いに戻す' : '支払い済みにする'}
            </button>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          {plannedTarget && (
            <button onClick={deletePlanned} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white" style={{ background: MONEY_DANGER }}>
              削除
            </button>
          )}
          <button onClick={closePlanned} className="flex-1 py-3.5 rounded-2xl text-sm font-medium" style={{ background: '#F0EBE6', color: '#78716C' }}>
            キャンセル
          </button>
          <button onClick={savePlanned} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white" style={{ background: MONEY_ACCENT }}>
            {plannedTarget ? '保存する' : '追加する'}
          </button>
        </div>
      </BottomSheet>

      {/* 使ったお金の記録 */}
      <ExpenseSheet
        open={expenseSheet}
        editing={null}
        categories={budget.categories}
        onClose={() => setExpenseSheet(false)}
        onSave={exp => setExpenses(prev => [...prev, exp])}
        onDelete={id => setExpenses(prev => prev.filter(x => x.id !== id))}
      />

      {/* カテゴリーの追加・編集 */}
      <BottomSheet
        open={catTarget !== null || catNew}
        onClose={closeCat}
        title={catTarget ? 'カテゴリーを編集' : 'カテゴリーを追加'}
      >
        <div className="space-y-4">
          <div>
            <label className="field-label" htmlFor="cat-emoji">アイコン</label>
            <input id="cat-emoji" type="text" maxLength={4} value={cEmoji} onChange={e => setCEmoji(e.target.value)}
              placeholder="🍚" className="input text-center" style={{ fontSize: 22 }} />
          </div>
          <div>
            <label className="field-label" htmlFor="cat-name">カテゴリー名 *</label>
            <input id="cat-name" type="text" value={cName} onChange={e => setCName(e.target.value)}
              placeholder="例：食費・日用品" className="input" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          {catTarget && (
            <button onClick={deleteCat} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white" style={{ background: MONEY_DANGER }}>
              削除
            </button>
          )}
          <button onClick={closeCat} className="flex-1 py-3.5 rounded-2xl text-sm font-medium" style={{ background: '#F0EBE6', color: '#78716C' }}>
            キャンセル
          </button>
          <button onClick={saveCat} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white" style={{ background: MONEY_ACCENT }}>
            {catTarget ? '保存する' : '追加する'}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
