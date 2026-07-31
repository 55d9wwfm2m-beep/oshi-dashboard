'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FixedCost } from '@/types';
import { formatYen, generateId } from '@/lib/utils';
import {
  MONEY_KEYS,
  MONEY_ACCENT,
  MONEY_ACCENT_BG,
  MONEY_DANGER,
  MONEY_DANGER_BG,
  digitsOnly,
  sortByPayDay,
  nextPaydayInfo,
  WEEKDAY_JA,
} from '@/lib/money';
import BottomSheet from '@/components/ui/BottomSheet';
import { showToast } from '@/components/ui/Toast';

const PAY_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const PAYDAY_RULE = '土日・祝日にあたる月は、その前の平日に自動で前倒しします。';

export default function MoneySettingsPage() {
  const [costs, setCosts, loaded] = useLocalStorage<FixedCost[]>(MONEY_KEYS.fixedCosts, []);
  const [payday, setPayday, paydayLoaded] = useLocalStorage<number>(MONEY_KEYS.payday, 0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [dayInput, setDayInput] = useState('1');
  const [deleteTarget, setDeleteTarget] = useState<FixedCost | null>(null);

  if (!loaded || !paydayLoaded) return null;

  const sorted = sortByPayDay(costs);
  const total = costs.reduce((s, c) => s + c.amount, 0);

  const amount = amountRaw === '' ? 0 : parseInt(amountRaw, 10) || 0;
  const canSave = nameInput.trim().length > 0 && amount > 0;

  const openAdd = () => {
    setEditId(null);
    setNameInput('');
    setAmountRaw('');
    setDayInput('1');
    setShowForm(true);
  };

  const openEdit = (cost: FixedCost) => {
    setEditId(cost.id);
    setNameInput(cost.name);
    setAmountRaw(String(cost.amount));
    setDayInput(String(cost.payDay));
    setShowForm(true);
  };

  const save = () => {
    if (!canSave) return;
    const name = nameInput.trim();
    const payDay = Math.min(Math.max(parseInt(dayInput, 10) || 1, 1), 31);
    if (editId) {
      setCosts(prev => prev.map(c => (c.id === editId ? { ...c, name, amount, payDay } : c)));
      showToast('固定費を更新しました');
    } else {
      setCosts(prev => [...prev, { id: generateId(), name, amount, payDay, paid: false }]);
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
      <div className="px-4 pt-8 pb-5 flex items-end justify-between">
        <div className="anim-fadeIn">
          <Link
            href="/money"
            className="inline-flex items-center gap-1 text-xs font-medium py-1 -my-1"
            style={{ color: '#A8A29E' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            やりくり電卓へ戻る
          </Link>
          <h1 className="text-2xl font-semibold mt-1" style={{ color: '#1C1917' }}>固定費の設定</h1>
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

      <div className="px-4 space-y-4">
        {/* 給料日 */}
        <div className="card p-5 anim-fadeInUp">
          <label className="field-label" htmlFor="payday-select">給料日</label>
          <select
            id="payday-select"
            value={String(payday)}
            onChange={e => {
              const v = parseInt(e.target.value, 10) || 0;
              setPayday(v);
              showToast(v ? `給料日を毎月${v}日に設定しました` : '給料日の設定を解除しました');
            }}
            className="input"
          >
            <option value="0">未設定</option>
            {PAY_DAYS.map(d => (
              <option key={d} value={d}>毎月 {d} 日</option>
            ))}
          </select>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#A8A29E' }}>
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
            <p className="text-[11px] font-medium tracking-wider uppercase" style={{ color: '#A8A29E' }}>
              毎月の固定費合計
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-semibold font-serif-num" style={{ color: '#1C1917', letterSpacing: '-0.02em' }}>
                {formatYen(total)}
              </p>
              <p className="text-xs" style={{ color: '#A8A29E' }}>{costs.length}件</p>
            </div>
          </div>
        )}

        {/* 固定費リスト */}
        {costs.length === 0 ? (
          <div className="text-center py-14 px-8 space-y-3 anim-fadeIn">
            <p className="text-5xl">🧾</p>
            <p className="text-base font-medium" style={{ color: '#78716C' }}>固定費がまだ登録されていません</p>
            <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
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
                  <p className="text-sm font-medium truncate" style={{ color: '#1C1917' }}>{cost.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>毎月{cost.payDay}日に支払い</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>{formatYen(cost.amount)}</p>
                  <button
                    onClick={() => openEdit(cost)}
                    className="text-[11px] mt-0.5 px-2 py-1.5 -my-1 rounded-lg"
                    style={{ color: '#A8A29E' }}
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

      {/* 追加・編集シート */}
      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? '固定費を編集' : '固定費を追加'}
      >
        <div className="space-y-4">
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
            <label className="field-label" htmlFor="fixed-cost-amount">金額 *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
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
            style={{ background: '#F0EBE6', color: '#78716C' }}
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
              <p className="text-sm font-medium" style={{ color: '#1C1917' }}>{deleteTarget.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>
                {formatYen(deleteTarget.amount)}・毎月{deleteTarget.payDay}日
              </p>
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: '#A8A29E' }}>
              削除すると元に戻せません。来月以降も発生する固定費は残しておくのがおすすめです。
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
                style={{ background: '#F0EBE6', color: '#78716C' }}
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
