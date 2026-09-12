'use client';

import MoneyIcon from '@/components/ui/MoneyIcon';
import BudgetBars from '@/components/ui/BudgetBars';

import { MONEY_ACCENT, MONEY_ACCENT_BG, MONEY_DANGER, MONEY_DANGER_BG, STATUS_META } from '@/components/ui/money-theme';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FixedCost, MoneyAccount, MonthlyRecord, MonthlyBudget, LivingExpense, SavingsRoadmap } from '@/types';
import { formatYen, getCurrentMonth } from '@/lib/utils';
import {
  MONEY_KEYS,
  statusOf,
  digitsOnly,
  unpaidTotal,
  formatYenSigned,
  nextPaydayInfo,
  paydayLabel,
  accountAmount,
  accountsTotal,
  budgetTotal,
  isBudgetAccount,
  legacyAccountSeed,
  addMonthlyRecord,
  formatMonthLabel,
  isVariable,
  hasActual,
  effectiveAmount,
  actualDiff,
  resetCostsForNewMonth,
  budgetBreakdown,
  plannedUnpaidTotal,
  spendingAlerts,
  currentPeriod,
  roadmapBalance,
  nextGoalInfo,
  formatMan,
  createDefaultRoadmap,
} from '@/lib/money';
import { showToast } from '@/components/ui/Toast';
import MoneyTabs from '@/components/ui/MoneyTabs';
import BudgetToggle from '@/components/ui/BudgetToggle';
import MonthlyRecap from '@/components/ui/MonthlyRecap';
import BottomSheet from '@/components/ui/BottomSheet';

/** ステータスの丸ドット付きピル（🟢安心 / 🟡少し注意 / 🔴節約モード） */
function StatusPill({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 mt-2.5 px-4 py-1.5 rounded-full text-xs font-bold"
      style={{ background: bg, color }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

export default function MoneyPage() {
  const [accounts, setAccounts, accountsLoaded] = useLocalStorage<MoneyAccount[]>(MONEY_KEYS.accounts, []);
  const [costs, setCosts, costsLoaded] = useLocalStorage<FixedCost[]>(MONEY_KEYS.fixedCosts, []);
  const [month, setMonth, monthLoaded] = useLocalStorage<string>(MONEY_KEYS.month, '');
  const [payday, , paydayLoaded] = useLocalStorage<number>(MONEY_KEYS.payday, 0);
  const [history, setHistory, historyLoaded] = useLocalStorage<MonthlyRecord[]>(MONEY_KEYS.history, []);
  const [budget, , budgetLoaded] = useLocalStorage<MonthlyBudget | null>(MONEY_KEYS.budget, null);
  const [expenses, , expensesLoaded] = useLocalStorage<LivingExpense[]>(MONEY_KEYS.expenses, []);
  const [roadmap, setRoadmap, roadmapLoaded] = useLocalStorage<SavingsRoadmap | null>(MONEY_KEYS.roadmap, null);
  const [recap, setRecap] = useState<MonthlyRecord | null>(null);
  const [showResetNotice, setShowResetNotice] = useState(false);
  const [actualTarget, setActualTarget] = useState<FixedCost | null>(null);
  const [actualRaw, setActualRaw] = useState('');
  const [simRaw, setSimRaw] = useState('');
  const [simOpen, setSimOpen] = useState(false);

  // 旧バージョンの所持金を「現金」口座として引き継ぐ（初回のみ）
  useEffect(() => {
    if (!accountsLoaded) return;
    const seed = legacyAccountSeed();
    if (seed) setAccounts(seed);
  }, [accountsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // 貯金ロードマップの初期データ（30歳までの目安）を一度だけ用意する
  useEffect(() => {
    if (!roadmapLoaded || !accountsLoaded || roadmap) return;
    const savings = accounts.filter(a => !isBudgetAccount(a)).reduce((s, a) => s + accountAmount(a), 0);
    setRoadmap(createDefaultRoadmap(getCurrentMonth(), savings));
  }, [roadmapLoaded, accountsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // 月が変わったら前月の記録を残し、支払い状況をすべて「未払い」に戻す
  // （固定費の登録内容はそのまま）
  useEffect(() => {
    if (!costsLoaded || !monthLoaded || !accountsLoaded || !historyLoaded) return;
    const current = currentPeriod(payday).key;
    if (month === current) return;

    // 前月の締めくくりを記録に残す（初回起動時は実績がないので保存しない）
    let saved = false;
    if (month && accounts.some(a => a.amount !== '')) {
      const record: MonthlyRecord = {
        month,
        spendable: budgetTotal(accounts) - unpaidTotal(costs),
        assets: accountsTotal(accounts),
        fixedCosts: costs.reduce((s, c) => s + effectiveAmount(c), 0),
        savedAt: new Date().toISOString(),
      };
      setHistory(prev => addMonthlyRecord(prev, record));
      setRecap(record);
      saved = true;
    }

    // 支払い状況と変動費の確定額だけを初期化（項目名・予想額・支払日・種類は残す）
    if (month && costs.some(c => c.paid || hasActual(c))) {
      setCosts(prev => resetCostsForNewMonth(prev));
      setShowResetNotice(true);
      if (!saved) showToast('新しい月になったので、支払い状況をリセットしました');
    }
    setMonth(current);
  }, [costsLoaded, monthLoaded, accountsLoaded, historyLoaded, paydayLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!accountsLoaded || !costsLoaded || !monthLoaded || !paydayLoaded || !historyLoaded
      || !budgetLoaded || !expensesLoaded || !roadmapLoaded) return null;

  // 貯金ロードマップの「次の目標」。未設定ならカードを出さない
  const goalInfo = roadmap ? nextGoalInfo(roadmap, roadmapBalance(roadmap, accounts)) : null;

  // 月予算（給料ベースの計画）。口座残高とは別データで、給料は残高に加算しない
  const plan = budget && budget.month === currentPeriod(payday).key ? budget : null;
  // いつもより明らかに多いカテゴリー（過去の自分の平均との比較）
  const alerts = plan ? spendingAlerts(expenses, plan.categories, plan.month, payday) : [];
  const planBreakdown = plan ? budgetBreakdown(plan, costs) : null;
  const unpaidPlanned = plan ? plannedUnpaidTotal(plan.planned) : 0;

  const paydayInfo = payday ? nextPaydayInfo(payday) : null;

  // どの口座も未入力なら結果を 0 円として扱う
  const balanceEmpty = !accounts.some(a => a.amount !== '');
  const assets = balanceEmpty ? 0 : accountsTotal(accounts);
  // 使っていいお金は「計算に含める」口座だけで算出する
  const balance = balanceEmpty ? 0 : budgetTotal(accounts);
  const hasExcluded = accounts.some(a => !isBudgetAccount(a));
  const unpaid = unpaidTotal(costs);
  const paidTotal = costs.filter(c => c.paid).reduce((s, c) => s + effectiveAmount(c), 0);
  // 所持金が未入力のときは結果を 0 円として扱う
  const spendable = balanceEmpty ? 0 : balance - unpaid - unpaidPlanned;
  const isShort = !balanceEmpty && spendable < 0;
  const heroMeta = STATUS_META[isShort ? 'tight' : statusOf(spendable)];

  // 買う前にチェック（購入シミュレーション）
  const simPrice = simRaw === '' ? 0 : parseInt(simRaw, 10) || 0;
  const simAfter = spendable - simPrice;
  const simMeta = STATUS_META[simAfter < 0 ? 'tight' : statusOf(simAfter)];
  const simVisible = simOpen && simPrice > 0 && !balanceEmpty;
  const simVerdict =
    simAfter < 0
      ? `${formatYen(-simAfter)} 足りません。今月は見送りが安心です`
      : statusOf(simAfter) === 'safe'
        ? `買っても ${formatYen(simAfter)} 残ります。余裕あり！`
        : statusOf(simAfter) === 'warn'
          ? `買うと残り ${formatYen(simAfter)}。少し注意です`
          : `買うと残り ${formatYen(simAfter)}。節約モードになります`;

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
      {/* Header */}
      <div className="money-header">
        <div className="anim-fadeIn">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Money</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: 'var(--ink)' }}>やりくり電卓</h1>
        </div>
        <Link
          href="/money/settings"
          className="text-xs font-medium px-4 py-2.5 rounded-full transition-all active:scale-95 anim-fadeIn"
          style={{ background: MONEY_ACCENT_BG, color: MONEY_ACCENT }}
        >
          固定費を設定
        </Link>
      </div>

      <MoneyTabs />

      <div className="money-content px-4 space-y-4">
        {/* 月替わりリセットの通知 */}
        {showResetNotice && (
          <div className="card p-4 anim-fadeIn" role="status">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: MONEY_ACCENT_BG }}
              >
                <MoneyIcon name="budget" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>新しい月になりました</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--sub)' }}>
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

        {/* 使っていいお金（最重要表示・残額に応じて色分け） */}
        <div
          className="card money-hero p-6 anim-scaleIn"
          style={{
            background: balanceEmpty
              ? `linear-gradient(165deg, ${MONEY_ACCENT_BG}, var(--surface) 60%)`
              : `linear-gradient(165deg, ${heroMeta.bg}, var(--surface) 60%)`,
          }}
        >
          {/* 給料日チップ（タップで設定へ） */}
          <div className="money-payday mb-3">
            {!paydayInfo ? (
              <Link
                href="/money/settings"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-transform"
                style={{ border: '1.5px dashed var(--line)', color: 'var(--muted)' }}
              >
                <MoneyIcon name="budget" /> 給料日を設定する
              </Link>
            ) : paydayInfo.days === 0 ? (
              <Link
                href="/money/settings"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-transform"
                style={{ background: MONEY_ACCENT_BG, color: MONEY_ACCENT }}
              >
                <MoneyIcon name="check" /> 今日は給料日！
              </Link>
            ) : (
              <Link
                href="/money/settings"
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-transform"
                style={{ background: 'var(--surface-2)', color: 'var(--sub)' }}
              >
                <MoneyIcon name="balance" /> 給料日 {paydayLabel(paydayInfo)} まで
                <b style={{ color: 'var(--ink)' }}>あと{paydayInfo.days}日</b>
              </Link>
            )}
          </div>
          <p className="money-hero-label" style={{ color: 'var(--sub)' }}>
            使っていいお金
          </p>
          <p
            className="money-hero-amount leading-tight font-semibold font-serif-num mt-1"
            style={{ color: balanceEmpty ? 'var(--ink)' : heroMeta.color, letterSpacing: '-0.03em' }}
          >
            <span key={spendable} className="money-number">{formatYenSigned(spendable)}</span>
          </p>

          {balanceEmpty ? (
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
              今持っているお金を入力すると自動で計算されます
            </p>
          ) : isShort ? (
            <>
              <div>
                <StatusPill color={heroMeta.color} bg={heroMeta.bg} label={heroMeta.label} />
              </div>
              <div
                className="inline-block mt-2 px-4 py-2 rounded-full text-xs font-medium"
                style={{ background: MONEY_DANGER_BG, color: MONEY_DANGER }}
              >
                固定費に対して {formatYen(-spendable)} 不足しています
              </div>
            </>
          ) : (
            <>
              <div>
                <StatusPill color={heroMeta.color} bg={heroMeta.bg} label={heroMeta.label} />
              </div>
              <div className="money-hero-details mt-4 pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--line)' }}>
                {hasExcluded ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--sub)' }}>総資産</span>
                      <span className="font-medium" style={{ color: 'var(--ink)' }}>{formatYen(assets)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--sub)' }}>予算対象残高</span>
                      <span className="font-medium" style={{ color: 'var(--ink)' }}>{formatYen(balance)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--sub)' }}>今持っているお金</span>
                    <span className="font-medium" style={{ color: 'var(--ink)' }}>{formatYen(balance)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--sub)' }}>未払いの固定費</span>
                  <span className="font-medium" style={{ color: 'var(--ink)' }}>−{formatYen(unpaid)}</span>
                </div>
                {unpaidPlanned > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--sub)' }}>未払いの予定支出</span>
                    <span className="font-medium" style={{ color: 'var(--ink)' }}>−{formatYen(unpaidPlanned)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 色の意味の凡例 */}
          <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 mt-4" aria-hidden="true">
            {(['safe', 'warn', 'tight'] as const).map(key => (
              <span key={key} className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: 'var(--muted)' }}>
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: STATUS_META[key].color }} />
                {STATUS_META[key].label}
                {key === 'safe' ? ' 3万円〜' : key === 'warn' ? ' 1〜3万円' : ' 1万円未満'}
              </span>
            ))}
          </div>
        </div>

        {/* 買う前にチェック（購入シミュレーション） */}
        <div className="card p-5 anim-fadeInUp">
          <label htmlFor="sim-price" className="field-label">買う前にチェック</label>
          <div className="money-sim-row">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>¥</span>
              <input
                id="sim-price"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={simRaw === '' ? '' : simPrice.toLocaleString('ja-JP')}
                onChange={e => {
                  const raw = digitsOnly(e.target.value);
                  setSimRaw(raw);
                  if (raw === '') setSimOpen(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && simPrice > 0) {
                    if (balanceEmpty) showToast('先に「今持っているお金」を入力してください');
                    else setSimOpen(true);
                  }
                }}
                placeholder="購入予定の金額"
                className="input pl-8"
              />
            </div>
            <button
              onClick={() => {
                if (balanceEmpty) {
                  showToast('先に「今持っているお金」を入力してください');
                  return;
                }
                setSimOpen(true);
              }}
              disabled={simPrice <= 0}
              className="px-5 rounded-xl text-sm font-bold text-white shrink-0 active:scale-95 transition-transform disabled:opacity-40"
              style={{ background: MONEY_ACCENT }}
            >
              計算
            </button>
          </div>

          {simVisible && (
            <div
              className="money-sim-result mt-4 pt-3.5 text-center"
              role="status"
              style={{ borderTop: '1.5px dashed rgba(28,18,12,0.09)' }}
            >
              <p className="text-xs font-medium tracking-wider" style={{ color: 'var(--sub)' }}>
                購入後の使っていいお金
              </p>
              <p
                className="text-[32px] leading-snug font-semibold font-serif-num mt-0.5"
                style={{ color: simMeta.color }}
              >
                {formatYenSigned(simAfter)}
              </p>
              <span
                className="inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: simMeta.bg, color: simMeta.color }}
              >
                {simVerdict}
              </span>
            </div>
          )}
        </div>

        {/* いつもより多めの支出（色だけでなく金額と平均を文言で示す） */}
        {alerts.length > 0 && (
          <div className="rounded-[18px] px-4 py-4 anim-fadeInUp" style={{ background: 'var(--warn-soft)' }}>
            <p className="text-xs font-bold mb-2.5" style={{ color: 'var(--warn)' }}>
              <MoneyIcon name="review" /> いつもより多めの支出があります
            </p>
            {alerts.slice(0, 3).map((a, i) => (
              <div
                key={a.category.id}
                className="py-2"
                style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(168,119,14,0.18)', paddingTop: i === 0 ? 0 : undefined }}
              >
                <p className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
                  <MoneyIcon name="category" /> {a.category.name}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)', fontVariantNumeric: 'tabular-nums' }}>
                  普段の月平均 {formatYen(a.average)}（{a.months}か月）／今月 {formatYen(a.current)}
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--warn)' }}>
                  いつもより約 {formatYen(a.diff)} 多め
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 今月のお金（月予算の要約） */}
        <Link href="/money/budget" className="block card card-hover p-5 anim-fadeInUp active:scale-[0.985]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: 'var(--sub)' }}>今月のお金</p>
            <span className="text-[11px] font-bold" style={{ color: MONEY_ACCENT }}>開く →</span>
          </div>

          {!planBreakdown || planBreakdown.income === 0 ? (
            <p className="text-xs text-center leading-relaxed py-1.5" style={{ color: 'var(--muted)' }}>
              給料を入力すると、貯金・固定費・予定支出を差し引いた<br />生活費の予算を計算します
            </p>
          ) : (
            <>
              <BudgetBars {...planBreakdown} />
              {[
                { k: '給料', v: formatYen(planBreakdown.income) },
                { k: '貯金確保', v: `−${formatYen(planBreakdown.saving)}` },
                { k: '固定費確保', v: `−${formatYen(planBreakdown.fixed)}` },
                ...(planBreakdown.planned > 0
                  ? [{ k: '予定支出確保', v: `−${formatYen(planBreakdown.planned)}` }]
                  : []),
              ].map(row => (
                <div key={row.k} className="flex justify-between items-baseline py-1">
                  <span className="text-[12.5px]" style={{ color: 'var(--sub)' }}>{row.k}</span>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                    {row.v}
                  </span>
                </div>
              ))}

              <div
                className="money-living flex justify-between items-baseline mt-2.5 pt-3"
                style={{ borderTop: '1px solid var(--line)' }}
              >
                <span className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>生活費予算</span>
                <span
                  className="text-2xl font-semibold font-serif-num"
                  style={{ color: planBreakdown.living < 0 ? MONEY_DANGER : MONEY_ACCENT }}
                >
                  {formatYenSigned(planBreakdown.living)}
                </span>
              </div>

              {plan && plan.categories.some(c => c.amount > 0) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
                  {plan.categories
                    .filter(c => c.amount > 0)
                    .sort((a, c) => c.amount - a.amount)
                    .slice(0, 3)
                    .map(c => (
                      <span key={c.id} className="text-[11px]" style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                        <MoneyIcon name="category" /> {c.name} {formatYen(c.amount)}
                      </span>
                    ))}
                  <span className="text-[11px] font-bold" style={{ color: MONEY_ACCENT }}>その他を見る →</span>
                </div>
              )}

              {planBreakdown.over > 0 && (
                <div
                  className="mt-3 px-3.5 py-2.5 rounded-2xl text-center text-[12.5px] font-bold"
                  style={{ background: MONEY_DANGER_BG, color: MONEY_DANGER }}
                >
                  予算を {formatYen(planBreakdown.over)} オーバーしています
                </div>
              )}
            </>
          )}
        </Link>

        {/* 次の貯金目標（タップでロードマップへ） */}
        {goalInfo && (
          <Link
            href="/money/roadmap"
            className="block card card-hover p-5 anim-fadeInUp active:scale-[0.985]"
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-medium" style={{ color: 'var(--sub)' }}>次の貯金目標</p>
              <span className="text-[11px] font-bold" style={{ color: MONEY_ACCENT }}>ロードマップを見る →</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[12.5px]" style={{ color: 'var(--sub)' }}>{formatMonthLabel(goalInfo.goal.month)}</span>
              <span
                className="text-[19px] font-bold font-serif-num"
                style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}
              >
                {formatMan(goalInfo.goal.amount)}
              </span>
            </div>
            <div
              className="h-2 rounded-[5px] overflow-hidden mt-[11px] mb-1.5"
              style={{ background: 'var(--surface-2)' }}
              role="img"
              aria-label={`目標 ${formatYen(goalInfo.goal.amount)} のうち ${formatYen(goalInfo.current)} 達成`}
            >
              <div
                className="h-full rounded-[5px]"
                style={{ width: `${Math.min(100, Math.round(goalInfo.ratio * 100))}%`, background: MONEY_ACCENT }}
              />
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[12.5px]" style={{ color: 'var(--sub)' }}>現在 {formatYen(goalInfo.current)}</span>
              <span
                className="text-[13px] font-bold"
                style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}
              >
                あと {formatYen(goalInfo.remaining)}
              </span>
            </div>
          </Link>
        )}

        {/* これまでの記録 */}
        {history.length > 0 && (
          <div className="card p-5 anim-fadeInUp">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium" style={{ color: 'var(--sub)' }}>これまでの記録</p>
              <span
                className="text-[10px] font-bold px-2 py-[3px] rounded-full"
                style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
              >
                {history.length}か月分
              </span>
            </div>
            <div>
              {history.map((r, i) => (
                <div
                  key={r.month}
                  className="flex items-center gap-3 py-3"
                  style={{ borderBottom: i === history.length - 1 ? 'none' : '1px solid var(--line)' }}
                >
                  <div className="shrink-0">
                    <p className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
                      {formatMonthLabel(r.month)}
                    </p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--muted)' }}>
                      総資産 {formatYen(r.assets)}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p
                      className="text-base font-bold"
                      style={{ color: r.spendable < 0 ? MONEY_DANGER : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatYenSigned(r.spendable)}
                    </p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--muted)' }}>
                      固定費 {formatYen(r.fixedCosts)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 固定費設定画面へ */}
        <Link
          href="/money/settings"
          className="block text-center py-4 rounded-2xl text-sm font-semibold text-white active:scale-[0.98] transition-transform anim-fadeInUp stagger-3"
          style={{ background: MONEY_ACCENT }}
        >
          固定費を設定する
        </Link>
      </div>

      {/* 請求額（確定額）の入力 */}
      <BottomSheet
        open={actualTarget !== null}
        onClose={() => setActualTarget(null)}
        title="請求額を入力"
      >
        {actualTarget && (
          <>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--warn-soft)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}><MoneyIcon name="info" /> {actualTarget.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>
                予想 {formatYen(actualTarget.amount)}・毎月{actualTarget.payDay}日
              </p>
            </div>

            <div className="mt-4">
              <label className="field-label" htmlFor="actual-amount">確定した請求額</label>
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

      {/* 月末の振り返り */}
      <MonthlyRecap record={recap} onClose={() => setRecap(null)} />
    </div>
  );
}
