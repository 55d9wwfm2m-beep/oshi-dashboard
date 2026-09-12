'use client';

import MoneyIcon from '@/components/ui/MoneyIcon';

import { MONEY_ACCENT, MONEY_ACCENT_BG, MONEY_DANGER, MONEY_DANGER_BG } from '@/components/ui/money-theme';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FixedCost, MoneyAccount } from '@/types';
import { formatYen, generateId } from '@/lib/utils';
import {
  MONEY_KEYS,
  digitsOnly,
  sortByPayDay,
  nextPaydayInfo,
  WEEKDAY_JA,
  accountAmount,
  accountsTotal,
  budgetTotal,
  isBudgetAccount,
  legacyAccountSeed,
  isVariable,
  hasActual,
  effectiveAmount,
} from '@/lib/money';
import BudgetToggle from '@/components/ui/BudgetToggle';
import BottomSheet from '@/components/ui/BottomSheet';
import { showToast } from '@/components/ui/Toast';
import MoneyTabs from '@/components/ui/MoneyTabs';

const PAY_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const PAYDAY_RULE = '土日・祝日にあたる月は、その前の平日に自動で前倒しします。';

export default function MoneySettingsPage() {
  const [costs, setCosts, loaded] = useLocalStorage<FixedCost[]>(MONEY_KEYS.fixedCosts, []);
  const [payday, setPayday, paydayLoaded] = useLocalStorage<number>(MONEY_KEYS.payday, 0);
  const [accounts, setAccounts, accountsLoaded] = useLocalStorage<MoneyAccount[]>(MONEY_KEYS.accounts, []);
  const [accForm, setAccForm] = useState<{ id: string | null; name: string; amount: string } | null>(null);
  const [accDeleteTarget, setAccDeleteTarget] = useState<MoneyAccount | null>(null);

  // 旧バージョンの所持金を「現金」口座として引き継ぐ（初回のみ）
  useEffect(() => {
    if (!accountsLoaded) return;
    const seed = legacyAccountSeed();
    if (seed) setAccounts(seed);
  }, [accountsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [dayInput, setDayInput] = useState('1');
  const [formVariable, setFormVariable] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FixedCost | null>(null);

  if (!loaded || !paydayLoaded || !accountsLoaded) return null;

  const accFormAmount = accForm && accForm.amount !== '' ? parseInt(accForm.amount, 10) || 0 : 0;
  const canSaveAcc = accForm !== null && accForm.name.trim().length > 0;

  const saveAccount = () => {
    if (!accForm || !canSaveAcc) return;
    const name = accForm.name.trim();
    if (accForm.id) {
      setAccounts(prev => prev.map(a => (a.id === accForm.id ? { ...a, name, amount: accForm.amount } : a)));
      showToast('口座を更新しました');
    } else {
      setAccounts(prev => [...prev, { id: generateId(), name, amount: accForm.amount, budget: true }]);
      showToast('口座を追加しました');
    }
    setAccForm(null);
  };

  const confirmDeleteAccount = () => {
    if (!accDeleteTarget) return;
    setAccounts(prev => prev.filter(a => a.id !== accDeleteTarget.id));
    showToast(`「${accDeleteTarget.name}」を削除しました`);
    setAccDeleteTarget(null);
  };

  const sorted = sortByPayDay(costs);
  const total = costs.reduce((s, c) => s + effectiveAmount(c), 0);

  const amount = amountRaw === '' ? 0 : parseInt(amountRaw, 10) || 0;
  const canSave = nameInput.trim().length > 0 && amount > 0;

  const openAdd = () => {
    setEditId(null);
    setNameInput('');
    setAmountRaw('');
    setDayInput('1');
    setFormVariable(false);
    setShowForm(true);
  };

  const openEdit = (cost: FixedCost) => {
    setEditId(cost.id);
    setNameInput(cost.name);
    setAmountRaw(String(cost.amount));
    setDayInput(String(cost.payDay));
    setFormVariable(isVariable(cost));
    setShowForm(true);
  };

  const save = () => {
    if (!canSave) return;
    const name = nameInput.trim();
    const payDay = Math.min(Math.max(parseInt(dayInput, 10) || 1, 1), 31);
    if (editId) {
      setCosts(prev =>
        prev.map(c =>
          c.id === editId
            ? {
                ...c, name, amount, payDay,
                variable: formVariable,
                // 「変動」から「固定」に変えたときは、残っている確定額を捨てる
                actual: formVariable ? (c.actual ?? null) : null,
              }
            : c
        )
      );
      showToast('固定費を更新しました');
    } else {
      setCosts(prev => [
        ...prev,
        { id: generateId(), name, amount, payDay, paid: false, variable: formVariable, actual: null },
      ]);
      showToast('固定費を追加しました');
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setCosts(prev => prev.filter(c => c.id !== deleteTarget.id));
    showToast(`「${deleteTarget.name}」を削除しました`);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="money-header">
        <div className="anim-fadeIn">
          <Link
            href="/money"
            className="inline-flex items-center gap-1 text-xs font-medium py-1 -my-1"
            style={{ color: 'var(--muted)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            やりくり電卓へ戻る
          </Link>
          <h1 className="text-2xl font-semibold mt-1" style={{ color: 'var(--ink)' }}>固定費の設定</h1>
        </div>
        <button
          onClick={openAdd}
          aria-label="固定費を追加"
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl shadow-md active:scale-90 transition-transform anim-fadeIn"
          style={{ background: MONEY_ACCENT }}
        >
          +
        </button>
      </div>

      <MoneyTabs />

      <div className="money-content px-4 space-y-4">
        {/* 口座 */}
        <div className="card p-5 anim-fadeInUp">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-sm font-medium" style={{ color: 'var(--sub)' }}>口座</p>
            <button
              onClick={() => setAccForm({ id: null, name: '', amount: '' })}
              className="text-xs font-semibold px-2 py-1.5 -my-1 rounded-lg"
              style={{ color: MONEY_ACCENT }}
            >
              ＋ 追加
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                現金・銀行・PayPayなど、持っているお金を<br />分けて登録できます
              </p>
              <button
                onClick={() => setAccForm({ id: null, name: '', amount: '' })}
                className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white active:scale-95 transition-transform"
                style={{ background: MONEY_ACCENT }}
              >
                ＋ 最初の口座を追加
              </button>
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
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: on ? 'var(--ink)' : 'var(--muted)' }}>
                            <span
                              className="mr-1"
                              style={{ opacity: on ? 0.85 : 0.45, filter: on ? 'none' : 'grayscale(1)' }}
                              aria-hidden="true"
                            >
                              <MoneyIcon name="balance" />
                            </span>
                            {acc.name}
                            {!on && (
                              <span
                                className="ml-1.5 text-[10px] font-bold px-2 py-[3px] rounded-full align-middle"
                                style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                              >
                                計算対象外
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                            {acc.amount === '' ? '未入力' : formatYen(accountAmount(acc))}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <button
                            onClick={() => setAccForm({ id: acc.id, name: acc.name, amount: acc.amount })}
                            className="text-[11px] px-2 py-1.5 rounded-lg"
                            style={{ color: 'var(--muted)' }}
                            aria-label={`${acc.name}を編集`}
                          >
                            編集
                          </button>
                          <button
                            onClick={() => setAccDeleteTarget(acc)}
                            className="text-[11px] px-2 py-1.5 rounded-lg"
                            style={{ color: MONEY_DANGER, opacity: 0.75 }}
                            aria-label={`${acc.name}を削除`}
                          >
                            削除
                          </button>
                        </div>
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

              {accounts.some(a => !isBudgetAccount(a)) ? (
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
        </div>

        {/* 給料日 */}
        <div className="card p-5 anim-fadeInUp">
          <label className="field-label" htmlFor="payday-select">給料日</label>
          <select
            id="payday-select"
            value={String(payday)}
            onChange={e => {
              const v = parseInt(e.target.value, 10) || 0;
              setPayday(v);
              showToast(v
                ? `給料日を毎月${v}日に設定しました。${v}日からの1か月で集計します`
                : '給料日の設定を解除しました。暦どおり1日からの1か月で集計します');
            }}
            className="input"
          >
            <option value="0">未設定</option>
            {PAY_DAYS.map(d => (
              <option key={d} value={d}>毎月 {d} 日</option>
            ))}
          </select>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {(() => {
              const info = payday ? nextPaydayInfo(payday) : null;
              if (!info) return `設定するとホームに給料日までの残り日数が表示されます。${PAYDAY_RULE}`;
              const d = `次回は ${info.date.getMonth() + 1}月${info.date.getDate()}日（${WEEKDAY_JA[info.date.getDay()]}）`;
              return `${d}${info.moved ? `。${payday}日が休日のため前倒しされます` : 'です'}。${PAYDAY_RULE}`;
            })()}
          </p>
        </div>

        {/* 合計サマリー */}
        {costs.length > 0 && (
          <div className="card p-5 anim-fadeInUp">
            <p className="text-[11px] font-medium tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
              毎月の固定費合計
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-semibold font-serif-num" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                {formatYen(total)}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{costs.length}件</p>
            </div>
          </div>
        )}

        {/* 固定費リスト */}
        {costs.length === 0 ? (
          <div className="text-center py-14 px-8 space-y-3 anim-fadeIn">
            <p className="text-5xl"><MoneyIcon name="budget" /></p>
            <p className="text-base font-medium" style={{ color: 'var(--sub)' }}>固定費がまだ登録されていません</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              家賃・スマホ代・サブスク・貯金など<br />毎月かならず出ていくお金を登録しましょう
            </p>
            <button
              onClick={openAdd}
              className="inline-block mt-2 px-6 py-3 rounded-full text-sm font-semibold text-white active:scale-95 transition-transform"
              style={{ background: MONEY_ACCENT }}
            >
              ＋ 最初の固定費を登録
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((cost, i) => (
              <div
                key={cost.id}
                className="card p-4 flex items-center gap-3 anim-fadeInUp"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                  style={{ background: MONEY_ACCENT_BG }}
                >
                  <span className="text-sm font-semibold leading-none" style={{ color: MONEY_ACCENT }}>
                    {cost.payDay}
                  </span>
                  <span className="text-[9px] leading-none mt-0.5" style={{ color: MONEY_ACCENT }}>日</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>
                    {isVariable(cost) && <MoneyIcon name="info" />}
                    {cost.name}
                    {isVariable(cost) && (
                      <span
                        className="ml-1.5 text-[9.5px] font-bold px-1.5 py-[2px] rounded-full align-middle"
                        style={
                          hasActual(cost)
                            ? { background: MONEY_ACCENT_BG, color: MONEY_ACCENT }
                            : { background: 'var(--warn-soft)', color: 'var(--warn)' }
                        }
                      >
                        {hasActual(cost) ? '確定' : '未確定'}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {!isVariable(cost)
                      ? `毎月${cost.payDay}日に支払い`
                      : hasActual(cost)
                        ? `確定 ${formatYen(cost.actual as number)}（予想 ${formatYen(cost.amount)}）`
                        : `予想 ${formatYen(cost.amount)}・${cost.payDay}日 支払い予定`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{formatYen(effectiveAmount(cost))}</p>
                  <button
                    onClick={() => openEdit(cost)}
                    className="text-[11px] mt-0.5 px-2 py-1.5 -my-1 rounded-lg"
                    style={{ color: 'var(--muted)' }}
                    aria-label={`${cost.name}を編集`}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cost)}
                    className="text-[11px] mt-0.5 px-2 py-1.5 -my-1 rounded-lg transition-colors"
                    style={{ color: '#D0C8C2' }}
                    aria-label={`${cost.name}を削除`}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 口座の追加・編集シート */}
      <BottomSheet
        open={accForm !== null}
        onClose={() => setAccForm(null)}
        title={accForm?.id ? '口座を編集' : '口座を追加'}
      >
        {accForm && (
          <>
            <div className="space-y-4">
              <div>
                <label className="field-label" htmlFor="account-name">口座名 *</label>
                <input
                  id="account-name"
                  type="text"
                  value={accForm.name}
                  onChange={e => setAccForm({ ...accForm, name: e.target.value })}
                  placeholder="例：現金・銀行・PayPay"
                  className="input"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="account-amount">今ある金額</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>¥</span>
                  <input
                    id="account-amount"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={accForm.amount === '' ? '' : accFormAmount.toLocaleString('ja-JP')}
                    onChange={e => setAccForm({ ...accForm, amount: digitsOnly(e.target.value) })}
                    placeholder="0"
                    className="input pl-8"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAccForm(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--sub)' }}
              >
                キャンセル
              </button>
              <button
                onClick={saveAccount}
                disabled={!canSaveAcc}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white disabled:opacity-40"
                style={{ background: MONEY_ACCENT }}
              >
                {accForm.id ? '保存する' : '追加する'}
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      {/* 口座の削除確認シート */}
      <BottomSheet
        open={accDeleteTarget !== null}
        onClose={() => setAccDeleteTarget(null)}
        title="口座を削除しますか？"
      >
        {accDeleteTarget && (
          <>
            <div className="p-4 rounded-2xl" style={{ background: MONEY_DANGER_BG }}>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{accDeleteTarget.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>
                {accDeleteTarget.amount === '' ? '残高は未入力' : `残高 ${formatYen(accountAmount(accDeleteTarget))}`}
              </p>
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
              削除すると、この口座の残高も一緒に消えます。元に戻せません。
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAccDeleteTarget(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--sub)' }}
              >
                キャンセル
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white"
                style={{ background: MONEY_DANGER }}
              >
                削除する
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      {/* 固定費の追加・編集シート */}
      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? '固定費を編集' : '固定費を追加'}
      >
        <div className="space-y-4">
          <div>
            <label className="field-label">種類</label>
            <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'var(--surface-2)' }} role="group" aria-label="固定費の種類">
              {([
                { key: false, label: '固定' },
                { key: true, label: '変動' },
              ] as const).map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  aria-pressed={formVariable === opt.key}
                  onClick={() => setFormVariable(opt.key)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                  style={
                    formVariable === opt.key
                      ? { background: 'var(--surface-2)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                      : { color: 'var(--muted)' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>
              {formVariable
                ? '毎月金額が変わる支出（電気代・ガス代・水道代など）'
                : '毎月ほぼ同じ金額の支出（家賃・サブスク・保険など）'}
            </p>
          </div>

          <div>
            <label className="field-label" htmlFor="fixed-cost-name">固定費名 *</label>
            <input
              id="fixed-cost-name"
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="例：家賃・スマホ代・サブスク"
              className="input"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="fixed-cost-amount">{formVariable ? '予想額 *' : '金額 *'}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>¥</span>
              <input
                id="fixed-cost-amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={amountRaw === '' ? '' : amount.toLocaleString('ja-JP')}
                onChange={e => setAmountRaw(digitsOnly(e.target.value))}
                placeholder="45,000"
                className="input pl-8"
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="fixed-cost-day">支払日</label>
            <select
              id="fixed-cost-day"
              value={dayInput}
              onChange={e => setDayInput(e.target.value)}
              className="input"
            >
              {PAY_DAYS.map(d => (
                <option key={d} value={d}>毎月 {d} 日</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowForm(false)}
            className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
            style={{ background: 'var(--surface-2)', color: 'var(--sub)' }}
          >
            キャンセル
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white disabled:opacity-40"
            style={{ background: MONEY_ACCENT }}
          >
            {editId ? '保存する' : '追加する'}
          </button>
        </div>
      </BottomSheet>

      {/* 削除の確認シート */}
      <BottomSheet
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="固定費を削除しますか？"
      >
        {deleteTarget && (
          <>
            <div className="p-4 rounded-2xl" style={{ background: MONEY_DANGER_BG }}>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{deleteTarget.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>
                {formatYen(deleteTarget.amount)}・毎月{deleteTarget.payDay}日
              </p>
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
              削除すると元に戻せません。来月以降も発生する固定費は残しておくのがおすすめです。
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--sub)' }}
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white"
                style={{ background: MONEY_DANGER }}
              >
                削除する
              </button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
