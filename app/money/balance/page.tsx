'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FixedCost, MoneyAccount, MonthlyBudget } from '@/types';
import { formatYen, getCurrentMonth } from '@/lib/utils';
import {
  MONEY_KEYS,
  MONEY_ACCENT,
  MONEY_ACCENT_BG,
  MONEY_DANGER,
  MONEY_DANGER_BG,
  digitsOnly,
  unpaidTotal,
  accountAmount,
  accountsTotal,
  budgetTotal,
  isBudgetAccount,
  legacyAccountSeed,
  isVariable,
  hasActual,
  effectiveAmount,
  actualDiff,
} from '@/lib/money';
import { showToast } from '@/components/ui/Toast';
import BudgetToggle from '@/components/ui/BudgetToggle';
import BottomSheet from '@/components/ui/BottomSheet';
import MoneyTabs from '@/components/ui/MoneyTabs';

/** 残高と支払い：口座残高の入力と、今月の固定費の支払いチェック */
export default function BalancePage() {
  const [accounts, setAccounts, accountsLoaded] = useLocalStorage<MoneyAccount[]>(MONEY_KEYS.accounts, []);
  const [costs, setCosts, costsLoaded] = useLocalStorage<FixedCost[]>(MONEY_KEYS.fixedCosts, []);
  const [budget, , budgetLoaded] = useLocalStorage<MonthlyBudget | null>(MONEY_KEYS.budget, null);
  const [actualTarget, setActualTarget] = useState<FixedCost | null>(null);
  const [actualRaw, setActualRaw] = useState('');

  if (!accountsLoaded || !costsLoaded || !budgetLoaded) return null;

  const hasExcluded = accounts.some(a => !isBudgetAccount(a));
  const unpaid = unpaidTotal(costs);
  const paidTotal = costs.filter(c => c.paid).reduce((s, c) => s + effectiveAmount(c), 0);
  const sorted = [...costs].sort((a, b) => a.payDay - b.payDay || a.name.localeCompare(b.name, 'ja'));

  const togglePaid = (id: string) =>
    setCosts(prev => prev.map(c => (c.id === id ? { ...c, paid: !c.paid } : c)));

  // 請求額（確定額）の入力
  const openActual = (cost: FixedCost) => {
    setActualTarget(cost);
    setActualRaw(hasActual(cost) ? String(cost.actual) : '');
  };
  const actualValue = actualRaw === '' ? 0 : parseInt(actualRaw, 10) || 0;
  const actualPreview = (() => {
    if (!actualTarget) return '';
    if (actualRaw === '') return '空のまま保存すると未確定に戻ります';
    const d = actualValue - actualTarget.amount;
    return d === 0 ? '予想どおりの金額です'
      : d < 0 ? `予想より ${formatYen(-d)} 安くなります`
      : `予想より ${formatYen(d)} 高くなります`;
  })();
  const saveActual = (value: number | null) => {
    if (!actualTarget) return;
    setCosts(prev => prev.map(c => (c.id === actualTarget.id ? { ...c, actual: value } : c)));
    setActualTarget(null);
    showToast(value === null ? '未確定に戻しました' : '請求額を反映しました');
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-8 pb-4 flex items-end justify-between">
        <div className="anim-fadeIn">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Balance</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>残高と支払い</h1>
        </div>
        <Link
          href="/money/settings"
          className="text-xs font-medium px-4 py-2.5 rounded-full active:scale-95 anim-fadeIn"
          style={{ background: MONEY_ACCENT_BG, color: MONEY_ACCENT }}
        >
          口座を編集
        </Link>
      </div>

      <MoneyTabs />

      <div className="px-4 space-y-4">
        {/* 今持っているお金（口座ごと） */}
        <div className="card p-5 anim-fadeInUp stagger-1">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-sm font-medium" style={{ color: '#78716C' }}>今持っているお金</p>
            <Link href="/money/settings" className="text-xs font-medium px-2 py-1.5 -my-1 rounded-lg" style={{ color: MONEY_ACCENT }}>
              口座を編集
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: '#A8A29E' }}>
                口座がまだありません。現金・銀行・PayPayなど、<br />持っているお金を分けて登録できます
              </p>
              <Link
                href="/money/settings"
                className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white active:scale-95 transition-transform"
                style={{ background: MONEY_ACCENT }}
              >
                ＋ 口座を追加する
              </Link>
            </div>
          ) : (
            <>
              <div>
                {accounts.map((acc, i) => {
                  const on = isBudgetAccount(acc);
                  return (
                    <div
                      key={acc.id}
                      className="py-3"
                      style={{
                        borderBottom: '1px solid rgba(28,18,12,0.06)',
                        paddingTop: i === 0 ? 0 : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[15px] leading-none shrink-0 transition-all"
                          style={{ opacity: on ? 0.85 : 0.45, filter: on ? 'none' : 'grayscale(1)' }}
                          aria-hidden="true"
                        >
                          {on ? '🏦' : '🔒'}
                        </span>
                        <label
                          htmlFor={`acc-${acc.id}`}
                          className="flex-1 min-w-0 text-sm font-semibold truncate"
                          style={{ color: on ? '#1C1917' : '#A8A29E' }}
                        >
                          {acc.name}
                        </label>
                        {!on && (
                          <span
                            className="text-[10px] font-bold px-2 py-[3px] rounded-full shrink-0"
                            style={{ background: '#F0EBE6', color: '#A8A29E' }}
                          >
                            計算対象外
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
                        <input
                          id={`acc-${acc.id}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={acc.amount === '' ? '' : accountAmount(acc).toLocaleString('ja-JP')}
                          onChange={e => {
                            const raw = digitsOnly(e.target.value);
                            setAccounts(prev => prev.map(a => (a.id === acc.id ? { ...a, amount: raw } : a)));
                          }}
                          placeholder="0"
                          className="input text-right font-semibold"
                          style={{
                            paddingLeft: 30,
                            fontVariantNumeric: 'tabular-nums',
                            color: on ? '#1C1917' : '#A8A29E',
                            background: on ? undefined : 'transparent',
                          }}
                        />
                      </div>

                      <BudgetToggle
                        on={on}
                        accent={MONEY_ACCENT}
                        onChange={() =>
                          setAccounts(prev => prev.map(a => (a.id === acc.id ? { ...a, budget: !on } : a)))
                        }
                      />
                    </div>
                  );
                })}
              </div>

              {/* 総資産と予算対象残高（対象外の口座があるときだけ2段で出す） */}
              {hasExcluded ? (
                <div className="mt-3.5 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(28,18,12,0.06)' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12.5px]" style={{ color: '#78716C' }}>総資産</span>
                    <span className="text-[15px] font-bold font-serif-num" style={{ color: '#1C1917' }}>
                      {formatYen(accountsTotal(accounts))}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12.5px] font-semibold" style={{ color: '#1C1917' }}>予算対象残高</span>
                    <span className="text-[19px] font-bold font-serif-num" style={{ color: MONEY_ACCENT }}>
                      {formatYen(budgetTotal(accounts))}
                    </span>
                  </div>
                </div>
              ) : accounts.length > 1 ? (
                <div
                  className="flex justify-between items-baseline mt-3.5 pt-3"
                  style={{ borderTop: '1px solid rgba(28,18,12,0.06)' }}
                >
                  <span className="text-sm font-medium" style={{ color: '#78716C' }}>合計</span>
                  <span className="text-xl font-semibold font-serif-num" style={{ color: '#1C1917' }}>
                    {formatYen(accountsTotal(accounts))}
                  </span>
                </div>
              ) : null}
            </>
          )}

          <p className="text-[11px] mt-3" style={{ color: '#A8A29E' }}>
            使っていいお金 ＝ 今持っているお金 − 未払いの固定費
          </p>
        </div>

        {/* 固定費リスト */}
        <div className="card p-5 anim-fadeInUp stagger-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: '#78716C' }}>今月の固定費</p>
            {costs.length > 0 && (
              <Link href="/money/settings" className="text-xs font-medium px-2 py-1.5 -my-1 rounded-lg" style={{ color: MONEY_ACCENT }}>
                編集
              </Link>
            )}
          </div>

          {costs.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-4xl">🧾</p>
              <p className="text-sm font-medium" style={{ color: '#78716C' }}>固定費がまだ登録されていません</p>
              <p className="text-xs leading-relaxed" style={{ color: '#A8A29E' }}>
                家賃・スマホ代・サブスクなどを登録すると<br />使っていいお金が自動で計算されます
              </p>
              <Link
                href="/money/settings"
                className="inline-block mt-1 px-6 py-3 rounded-full text-sm font-semibold text-white active:scale-95 transition-transform"
                style={{ background: MONEY_ACCENT }}
              >
                ＋ 固定費を登録する
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-1">
                {sorted.map(cost => {
                  const variable = isVariable(cost);
                  const settled = hasActual(cost);
                  const diff = actualDiff(cost);

                  // 金額の下に出す補助情報（小さく1行だけ）
                  const sub = !variable
                    ? `毎月${cost.payDay}日`
                    : !settled
                      ? `予想 ${formatYen(cost.amount)}・${cost.payDay}日 支払い予定`
                      : diff === 0
                        ? '予想どおりの金額でした'
                        : diff! < 0
                          ? `予想より ${formatYen(-diff!)} 安くなりました`
                          : `予想より ${formatYen(diff!)} 高くなりました`;
                  const subColor = variable && settled && diff !== 0
                    ? (diff! < 0 ? MONEY_ACCENT : MONEY_DANGER)
                    : '#A8A29E';

                  return (
                    <li key={cost.id} style={{ borderBottom: '1px solid rgba(28,18,12,0.05)' }}>
                      <button
                        onClick={() => togglePaid(cost.id)}
                        aria-pressed={cost.paid}
                        aria-label={`${cost.name} を${cost.paid ? '未払い' : '支払い済み'}にする`}
                        className="w-full flex items-center gap-3 pt-3.5 pb-2 text-left active:opacity-70 transition-opacity"
                      >
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                          style={
                            cost.paid
                              ? { background: MONEY_ACCENT }
                              : { border: '2px solid #D9D3CD', background: 'white' }
                          }
                          aria-hidden="true"
                        >
                          {cost.paid && (
                            <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth={2.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5l3.5 3.5 7.5-8.5" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span
                            className="block text-sm font-medium truncate"
                            style={{ color: cost.paid ? '#A8A29E' : '#1C1917' }}
                          >
                            {variable && '⚡ '}
                            {cost.name}
                            {variable && (
                              <span
                                className="ml-1.5 text-[9.5px] font-bold px-1.5 py-[2px] rounded-full align-middle"
                                style={
                                  settled
                                    ? { background: MONEY_ACCENT_BG, color: MONEY_ACCENT }
                                    : { background: 'rgba(168,119,14,0.10)', color: '#A8770E' }
                                }
                              >
                                {settled ? '確定' : '未確定'}
                              </span>
                            )}
                          </span>
                          <span
                            className="block text-[11px] mt-0.5"
                            style={{ color: subColor, fontWeight: subColor === '#A8A29E' ? 400 : 600 }}
                          >
                            {sub}
                          </span>
                        </span>
                        <span className="text-right shrink-0">
                          <span
                            className="block text-sm font-semibold"
                            style={
                              cost.paid
                                ? { color: '#A8A29E', textDecoration: 'line-through' }
                                : { color: '#1C1917' }
                            }
                          >
                            {formatYen(effectiveAmount(cost))}
                          </span>
                          <span
                            className="block text-[11px] mt-0.5 font-medium"
                            style={{ color: cost.paid ? MONEY_ACCENT : '#A8A29E' }}
                          >
                            {cost.paid ? '支払い済み' : '未払い'}
                          </span>
                        </span>
                      </button>

                      {variable && (
                        <button
                          onClick={() => openActual(cost)}
                          className="ml-9 mb-3 px-3.5 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-transform"
                          style={
                            settled
                              ? { background: '#F0EBE6', color: '#78716C' }
                              : { background: 'rgba(168,119,14,0.10)', color: '#A8770E' }
                          }
                        >
                          {settled ? '請求額を修正' : '請求額を入力'}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="pt-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#78716C' }}>未払いの合計</span>
                  <span className="text-lg font-semibold font-serif-num" style={{ color: '#1C1917' }}>
                    {formatYen(unpaid)}
                  </span>
                </div>
                {paidTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px]" style={{ color: '#A8A29E' }}>支払い済みの合計</span>
                    <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
                      {formatYen(paidTotal)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* 請求額（確定額）の入力 */}
      <BottomSheet
        open={actualTarget !== null}
        onClose={() => setActualTarget(null)}
        title="請求額を入力"
      >
        {actualTarget && (
          <>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(168,119,14,0.10)' }}>
              <p className="text-sm font-medium" style={{ color: '#1C1917' }}>⚡ {actualTarget.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>
                予想 {formatYen(actualTarget.amount)}・毎月{actualTarget.payDay}日
              </p>
            </div>

            <div className="mt-4">
              <label className="field-label" htmlFor="actual-amount">確定した請求額</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
                <input
                  id="actual-amount"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={actualRaw === '' ? '' : actualValue.toLocaleString('ja-JP')}
                  onChange={e => setActualRaw(digitsOnly(e.target.value))}
                  placeholder="0"
                  className="input pl-8"
                />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: '#A8A29E' }}>{actualPreview}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => saveActual(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
                style={{ background: '#F0EBE6', color: '#78716C' }}
              >
                未確定に戻す
              </button>
              <button
                onClick={() => saveActual(actualRaw === '' ? null : actualValue)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white"
                style={{ background: MONEY_ACCENT }}
              >
                保存する
              </button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
