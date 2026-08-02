'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FixedCost } from '@/types';
import { formatYen, getCurrentMonth } from '@/lib/utils';
import {
  MONEY_KEYS,
  MONEY_ACCENT,
  MONEY_ACCENT_BG,
  MONEY_DANGER,
  MONEY_DANGER_BG,
  digitsOnly,
  unpaidTotal,
  formatYenSigned,
} from '@/lib/money';
import { showToast } from '@/components/ui/Toast';

export default function MoneyPage() {
  const [balanceRaw, setBalanceRaw, balanceLoaded] = useLocalStorage<string>(MONEY_KEYS.balance, '');
  const [costs, setCosts, costsLoaded] = useLocalStorage<FixedCost[]>(MONEY_KEYS.fixedCosts, []);
  const [month, setMonth, monthLoaded] = useLocalStorage<string>(MONEY_KEYS.month, '');
  const [showResetNotice, setShowResetNotice] = useState(false);

  // 月が変わっていたら支払い状況をすべて「未払い」に戻す（固定費の登録内容は残す）
  useEffect(() => {
    if (!costsLoaded || !monthLoaded) return;
    const current = getCurrentMonth();
    if (month === current) return;
    if (month && costs.some(c => c.paid)) {
      setCosts(prev => prev.map(c => ({ ...c, paid: false })));
      setShowResetNotice(true);
      showToast('新しい月になったので、支払い状況をリセットしました');
    }
    setMonth(current);
  }, [costsLoaded, monthLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!balanceLoaded || !costsLoaded || !monthLoaded) return null;

  const balanceEmpty = balanceRaw === '';
  const balance = balanceEmpty ? 0 : parseInt(balanceRaw, 10) || 0;
  const unpaid = unpaidTotal(costs);
  const paidTotal = costs.filter(c => c.paid).reduce((s, c) => s + c.amount, 0);
  // 所持金が未入力のときは結果を 0 円として扱う
  const spendable = balanceEmpty ? 0 : balance - unpaid;
  const isShort = !balanceEmpty && spendable < 0;

  const sorted = [...costs].sort((a, b) => a.payDay - b.payDay || a.name.localeCompare(b.name, 'ja'));

  const togglePaid = (id: string) =>
    setCosts(prev => prev.map(c => (c.id === id ? { ...c, paid: !c.paid } : c)));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-8 pb-5 flex items-end justify-between">
        <div className="anim-fadeIn">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Money</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>やりくり電卓</h1>
        </div>
        <Link
          href="/money/settings"
          className="text-xs font-medium px-4 py-2.5 rounded-full transition-all active:scale-95 anim-fadeIn"
          style={{ background: MONEY_ACCENT_BG, color: MONEY_ACCENT }}
        >
          固定費を設定
        </Link>
      </div>

      <div className="px-4 space-y-4">
        {/* 月替わりリセットの通知 */}
        {showResetNotice && (
          <div className="card p-4 anim-fadeIn" role="status">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: MONEY_ACCENT_BG }}
              >
                🗓️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#1C1917' }}>新しい月になりました</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#78716C' }}>
                  固定費の支払い状況をすべて「未払い」に戻しました。登録した固定費はそのまま残っています。
                </p>
              </div>
              <button
                onClick={() => setShowResetNotice(false)}
                className="text-xs font-medium px-3 py-2 -my-1 rounded-lg shrink-0 active:scale-95 transition-transform"
                style={{ color: MONEY_ACCENT }}
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* 使っていいお金（最重要表示） */}
        <div
          className="card p-6 text-center anim-scaleIn"
          style={{
            background: isShort
              ? `linear-gradient(165deg, ${MONEY_DANGER_BG}, #FFFFFF 60%)`
              : `linear-gradient(165deg, ${MONEY_ACCENT_BG}, #FFFFFF 60%)`,
          }}
        >
          <p className="text-xs font-medium tracking-widest" style={{ color: '#78716C' }}>
            使っていいお金
          </p>
          <p
            className="text-[46px] leading-tight font-semibold font-serif-num mt-1"
            style={{ color: isShort ? MONEY_DANGER : '#1C1917', letterSpacing: '-0.03em' }}
          >
            {formatYenSigned(spendable)}
          </p>

          {balanceEmpty ? (
            <p className="text-xs mt-2" style={{ color: '#A8A29E' }}>
              今持っているお金を入力すると自動で計算されます
            </p>
          ) : isShort ? (
            <div
              className="inline-block mt-3 px-4 py-2 rounded-full text-xs font-medium"
              style={{ background: MONEY_DANGER_BG, color: MONEY_DANGER }}
            >
              固定費に対して {formatYen(-spendable)} 不足しています
            </div>
          ) : (
            <div className="mt-4 pt-3 space-y-1.5" style={{ borderTop: '1px solid rgba(28,18,12,0.06)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#78716C' }}>今持っているお金</span>
                <span className="font-medium" style={{ color: '#1C1917' }}>{formatYen(balance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#78716C' }}>未払いの固定費</span>
                <span className="font-medium" style={{ color: '#1C1917' }}>−{formatYen(unpaid)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 今持っているお金の入力 */}
        <div className="card p-5 anim-fadeInUp stagger-1">
          <label htmlFor="money-balance" className="field-label">今持っているお金</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
            <input
              id="money-balance"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={balanceEmpty ? '' : balance.toLocaleString('ja-JP')}
              onChange={e => setBalanceRaw(digitsOnly(e.target.value))}
              placeholder="0"
              className="input pl-8"
              style={{ fontSize: 18, fontWeight: 600 }}
            />
          </div>
          <p className="text-[11px] mt-2" style={{ color: '#A8A29E' }}>
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
                {sorted.map(cost => (
                  <li key={cost.id} style={{ borderBottom: '1px solid rgba(28,18,12,0.05)' }}>
                    <button
                      onClick={() => togglePaid(cost.id)}
                      aria-pressed={cost.paid}
                      aria-label={`${cost.name} を${cost.paid ? '未払い' : '支払い済み'}にする`}
                      className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-70 transition-opacity"
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
                          {cost.name}
                        </span>
                        <span className="block text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>
                          毎月{cost.payDay}日
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
                          {formatYen(cost.amount)}
                        </span>
                        <span
                          className="block text-[11px] mt-0.5 font-medium"
                          style={{ color: cost.paid ? MONEY_ACCENT : '#A8A29E' }}
                        >
                          {cost.paid ? '支払い済み' : '未払い'}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
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

        {/* 固定費設定画面へ */}
        <Link
          href="/money/settings"
          className="block text-center py-4 rounded-2xl text-sm font-semibold text-white active:scale-[0.98] transition-transform anim-fadeInUp stagger-3"
          style={{ background: MONEY_ACCENT }}
        >
          固定費を設定する
        </Link>
      </div>
    </div>
  );
}
