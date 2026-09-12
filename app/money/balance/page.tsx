'use client';

import MoneyIcon from '@/components/ui/MoneyIcon';

import { MONEY_ACCENT, MONEY_ACCENT_BG, MONEY_DANGER, MONEY_DANGER_BG } from '@/components/ui/money-theme';

import { useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FixedCost, MoneyAccount, MonthlyBudget } from '@/types';
import { formatYen, getCurrentMonth } from '@/lib/utils';
import {
  MONEY_KEYS,
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
    const base = isVariable(actualTarget) ? '予想' : '登録額';
    if (actualRaw === '') {
      return isVariable(actualTarget) ? '空のまま保存すると未確定に戻ります' : '空のまま保存すると登録額で計算します';
    }
    const d = actualValue - actualTarget.amount;
    return d === 0 ? `${base}どおりの金額です`
      : d < 0 ? `${base}より ${formatYen(-d)} 安くなります`
      : `${base}より ${formatYen(d)} 高くなります`;
  })();
  const saveActual = (value: number | null) => {
    if (!actualTarget) return;
    setCosts(prev => prev.map(c => (c.id === actualTarget.id ? { ...c, actual: value } : c)));
    const isVar = isVariable(actualTarget);
    setActualTarget(null);
    showToast(value === null
      ? (isVar ? '未確定に戻しました' : '登録額に戻しました')
      : (isVar ? '請求額を反映しました' : '実際に払った額を反映しました'));
  };

  return (
    <div className="min-h-screen">
      <div className="money-header">
        <div className="anim-fadeIn">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Balance</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: 'var(--ink)' }}>残高と支払い</h1>
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

      <div className="money-content px-4 space-y-4">
        {/* 今持っているお金（口座ごと） */}
        <div className="card p-5 anim-fadeInUp stagger-1">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-sm font-medium" style={{ color: 'var(--sub)' }}>今持っているお金</p>
            <Link href="/money/settings" className="text-xs font-medium px-2 py-1.5 -my-1 rounded-lg" style={{ color: MONEY_ACCENT }}>
              口座を編集
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
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
                        borderBottom: '1px solid var(--line)',
                        paddingTop: i === 0 ? 0 : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[15px] leading-none shrink-0 transition-all"
                          style={{ opacity: on ? 0.85 : 0.45, filter: on ? 'none' : 'grayscale(1)' }}
                          aria-hidden="true"
                        >
                          <MoneyIcon name="balance" />
                        </span>
                        <label
                          htmlFor={`acc-${acc.id}`}
                          className="flex-1 min-w-0 text-sm font-semibold truncate"
                          style={{ color: on ? 'var(--ink)' : 'var(--muted)' }}
                        >
                          {acc.name}
                        </label>
                        {!on && (
                          <span
                            className="text-[10px] font-bold px-2 py-[3px] rounded-full shrink-0"
                            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                          >
                            計算対象外
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>¥</span>
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
                            color: on ? 'var(--ink)' : 'var(--muted)',
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
                <div className="mt-3.5 pt-3 space-y-2" style={{ borderTop: '1px solid var(--line)' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12.5px]" style={{ color: 'var(--sub)' }}>総資産</span>
                    <span className="text-[15px] font-bold font-serif-num" style={{ color: 'var(--ink)' }}>
                      {formatYen(accountsTotal(accounts))}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12.5px] font-semibold" style={{ color: 'var(--ink)' }}>予算対象残高</span>
                    <span className="text-[19px] font-bold font-serif-num" style={{ color: MONEY_ACCENT }}>
                      {formatYen(budgetTotal(accounts))}
                    </span>
                  </div>
                </div>
              ) : accounts.length > 1 ? (
                <div
                  className="flex justify-between items-baseline mt-3.5 pt-3"
                  style={{ borderTop: '1px solid var(--line)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--sub)' }}>合計</span>
                  <span className="text-xl font-semibold font-serif-num" style={{ color: 'var(--ink)' }}>
                    {formatYen(accountsTotal(accounts))}
                  </span>
                </div>
              ) : null}
            </>
          )}

          <p className="text-[11px] mt-3" style={{ color: 'var(--muted)' }}>
            使っていいお金 ＝ 今持っているお金 − 未払いの固定費
          </p>
        </div>

        {/* 固定費リスト */}
        <div className="card p-5 anim-fadeInUp stagger-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: 'var(--sub)' }}>今月の固定費</p>
            {costs.length > 0 && (
              <Link href="/money/settings" className="text-xs font-medium px-2 py-1.5 -my-1 rounded-lg" style={{ color: MONEY_ACCENT }}>
                編集
              </Link>
            )}
          </div>

          {costs.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-4xl"><MoneyIcon name="budget" /></p>
              <p className="text-sm font-medium" style={{ color: 'var(--sub)' }}>固定費がまだ登録されていません</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
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
                  const base = variable ? '予想' : '登録額';
                  const sub = !settled
                    ? (variable ? `予想 ${formatYen(cost.amount)}・${cost.payDay}日 支払い予定` : `毎月${cost.payDay}日`)
                    : diff === 0
                      ? `${base}どおりの金額でした`
                      : diff! < 0
                        ? `${base}より ${formatYen(-diff!)} 安くなりました`
                        : `${base}より ${formatYen(diff!)} 高くなりました`;
                  const subColor = settled && diff !== 0
                    ? (diff! < 0 ? MONEY_ACCENT : MONEY_DANGER)
                    : 'var(--muted)';

                  return (
                    <li key={cost.id} style={{ borderBottom: '1px solid var(--line)' }}>
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
                              : { border: '2px solid #536159', background: 'var(--surface-2)' }
                          }
                          aria-hidden="true"
                        >
                          {cost.paid && (
                            <svg viewBox="0 0 20 20" fill="none" stroke="var(--bg)" strokeWidth={2.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5l3.5 3.5 7.5-8.5" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span
                            className="block text-sm font-medium truncate"
                            style={{ color: cost.paid ? 'var(--muted)' : 'var(--ink)' }}
                          >
                            {variable && <MoneyIcon name="info" />}
                            {cost.name}
                            {/* 変動費は未確定/確定、固定費は実額を入れたときだけ「実額」 */}
                            {(variable || settled) && (
                              <span
                                className="ml-1.5 text-[9.5px] font-bold px-1.5 py-[2px] rounded-full align-middle"
                                style={
                                  settled
                                    ? { background: MONEY_ACCENT_BG, color: MONEY_ACCENT }
                                    : { background: 'var(--warn-soft)', color: 'var(--warn)' }
                                }
                              >
                                {settled ? (variable ? '確定' : '実額') : '未確定'}
                              </span>
                            )}
                          </span>
                          <span
                            className="block text-[11px] mt-0.5"
                            style={{ color: subColor, fontWeight: subColor === 'var(--muted)' ? 400 : 600 }}
                          >
                            {sub}
                          </span>
                        </span>
                        <span className="text-right shrink-0">
                          <span
                            className="block text-sm font-semibold"
                            style={
                              cost.paid
                                ? { color: 'var(--muted)', textDecoration: 'line-through' }
                                : { color: 'var(--ink)' }
                            }
                          >
                            {formatYen(effectiveAmount(cost))}
                          </span>
                          <span
                            className="block text-[11px] mt-0.5 font-medium"
                            style={{ color: cost.paid ? MONEY_ACCENT : 'var(--muted)' }}
                          >
                            {cost.paid ? '支払い済み' : '未払い'}
                          </span>
                        </span>
                      </button>

                      {/* 割り勘などで金額が変わることがあるので、固定費でも実額を入れられるようにする */}
                      <button
                        onClick={() => openActual(cost)}
                        className="ml-9 mb-3 px-3.5 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-transform"
                        style={
                          settled || !variable
                            ? { background: 'var(--surface-2)', color: 'var(--sub)' }
                            : { background: 'var(--warn-soft)', color: 'var(--warn)' }
                        }
                      >
                        {variable
                          ? (settled ? '請求額を修正' : '請求額を入力')
                          : (settled ? '実際の額を修正' : '実際に払った額を入力')}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="pt-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--sub)' }}>未払いの合計</span>
                  <span className="text-lg font-semibold font-serif-num" style={{ color: 'var(--ink)' }}>
                    {formatYen(unpaid)}
                  </span>
                </div>
                {paidTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px]" style={{ color: 'var(--muted)' }}>支払い済みの合計</span>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                      {formatYen(paidTotal)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* 実際に払った額の入力（変動費は請求額、固定費は割り勘などの実額） */}
      <BottomSheet
        open={actualTarget !== null}
        onClose={() => setActualTarget(null)}
        title={actualTarget && !isVariable(actualTarget) ? '実際に払った額を入力' : '請求額を入力'}
      >
        {actualTarget && (
          <>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--warn-soft)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                {isVariable(actualTarget) && <MoneyIcon name="info" />}{actualTarget.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>
                {isVariable(actualTarget) ? '予想' : '登録額'} {formatYen(actualTarget.amount)}・毎月{actualTarget.payDay}日
              </p>
            </div>

            <div className="mt-4">
              <label className="field-label" htmlFor="actual-amount">
                {isVariable(actualTarget) ? '確定した請求額' : '実際に自分が払った額'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>¥</span>
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
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>{actualPreview}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => saveActual(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--sub)' }}
              >
                {isVariable(actualTarget) ? '未確定に戻す' : '登録額に戻す'}
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
