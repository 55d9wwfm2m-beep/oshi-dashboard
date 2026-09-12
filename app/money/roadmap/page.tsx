'use client';

import MoneyIcon from '@/components/ui/MoneyIcon';

import { MONEY_ACCENT, MONEY_ACCENT_BG, MONEY_DANGER } from '@/components/ui/money-theme';

import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MoneyAccount, SavingsMilestone, SavingsRoadmap } from '@/types';
import { formatYen, generateId } from '@/lib/utils';
import {
  MONEY_KEYS,
  digitsOnly,
  formatMonthLabel,
  formatMan,
  createDefaultRoadmap,
  sortMilestones,
  roadmapBalance,
  roadmapAccounts,
  nextGoalInfo,
  isMilestoneDone,
  ratioPercent,
  isBudgetAccount,
  accountAmount,
  PACE_TEXT,
} from '@/lib/money';
import BottomSheet from '@/components/ui/BottomSheet';
import BudgetToggle from '@/components/ui/BudgetToggle';
import MoneyTabs from '@/components/ui/MoneyTabs';
import { showToast } from '@/components/ui/Toast';

const WARN = 'var(--warn)';

function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

type Form = { id: string | null; month: string; name: string; kind: 'goal' | 'event'; amount: string; after: string };

/** 貯金ロードマップ：「いつまでに、いくら貯めたいか」を並べる画面 */
export default function RoadmapPage() {
  const [roadmap, setRoadmap, roadmapLoaded] = useLocalStorage<SavingsRoadmap | null>(MONEY_KEYS.roadmap, null);
  const [accounts, , accountsLoaded] = useLocalStorage<MoneyAccount[]>(MONEY_KEYS.accounts, []);
  const [form, setForm] = useState<Form | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);

  // 初回だけ、30歳までの目安を初期データとして入れる
  useEffect(() => {
    if (!roadmapLoaded || !accountsLoaded || roadmap) return;
    const savings = accounts.filter(a => !isBudgetAccount(a)).reduce((s, a) => s + accountAmount(a), 0);
    setRoadmap(createDefaultRoadmap(thisMonth(), savings));
  }, [roadmapLoaded, accountsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!roadmapLoaded || !accountsLoaded || !roadmap) return null;

  const current = roadmapBalance(roadmap, accounts);
  const info = nextGoalInfo(roadmap, current);
  const list = sortMilestones(roadmap.milestones);
  const picked = roadmapAccounts(roadmap, accounts).map(a => a.id);

  const update = (patch: Partial<SavingsRoadmap>) =>
    setRoadmap(prev => (prev ? { ...prev, ...patch } : prev));

  const openForm = (m: SavingsMilestone | null) =>
    setForm(m
      ? { id: m.id, month: m.month, name: m.name, kind: m.kind, amount: String(m.amount), after: typeof m.after === 'number' ? String(m.after) : '' }
      : { id: null, month: thisMonth(), name: '', kind: 'goal', amount: '', after: '' });

  const formAmount = form && form.amount !== '' ? parseInt(form.amount, 10) || 0 : 0;
  const formAfter = form && form.after !== '' ? parseInt(form.after, 10) || 0 : null;

  const saveForm = () => {
    if (!form) return;
    const name = form.name.trim();
    if (!name || !form.month || formAmount <= 0) {
      showToast('名前・年月・金額を入力してください');
      return;
    }
    const item: SavingsMilestone = {
      id: form.id ?? generateId(),
      month: form.month,
      name,
      kind: form.kind,
      amount: formAmount,
      after: form.kind === 'event' ? formAfter : null,
    };
    update({
      milestones: form.id
        ? roadmap.milestones.map(m => (m.id === form.id ? item : m))
        : [...roadmap.milestones, item],
    });
    showToast(form.id ? '目標を更新しました' : '目標を追加しました');
    setForm(null);
  };

  const deleteForm = () => {
    if (!form?.id) return;
    update({ milestones: roadmap.milestones.filter(m => m.id !== form.id) });
    showToast('目標を削除しました');
    setForm(null);
  };

  /** 未選択のあいだは「計算対象外の口座」が既定なので、まずその並びを実体化する */
  const toggleAccount = (id: string) => {
    const base = roadmap.accountIds.length > 0 ? [...roadmap.accountIds] : picked;
    const at = base.indexOf(id);
    update({ accountIds: at === -1 ? [...base, id] : base.filter(x => x !== id) });
  };

  const moneyField = (value: string, onChange: (raw: string) => void, placeholder: string, id: string) => (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>¥</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value === '' ? '' : (parseInt(value, 10) || 0).toLocaleString('ja-JP')}
        onChange={e => onChange(digitsOnly(e.target.value))}
        placeholder={placeholder}
        className="input pl-8"
      />
    </div>
  );

  const pct = info ? Math.min(100, Math.round(info.ratio * 100)) : 0;
  const pace = info ? PACE_TEXT[info.pace] : null;
  const paceStyle = info && (info.pace === 'done' || info.pace === 'ahead')
    ? { background: MONEY_ACCENT_BG, color: MONEY_ACCENT }
    : info?.pace === 'close'
      ? { background: 'var(--warn-soft)', color: WARN }
      : { background: 'var(--danger-soft)', color: MONEY_DANGER };

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-8 pb-4 flex items-end justify-between gap-3">
        <div className="anim-fadeIn min-w-0">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Roadmap</p>
          <h1 className="text-xl font-semibold mt-0.5" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            30歳までのロードマップ
          </h1>
        </div>
        <button
          onClick={() => setSourceOpen(true)}
          className="shrink-0 text-xs font-medium px-4 py-2.5 rounded-full active:scale-95 anim-fadeIn"
          style={{ background: MONEY_ACCENT_BG, color: MONEY_ACCENT }}
        >
          対象残高
        </button>
      </div>

      <MoneyTabs />

      <div className="money-content px-4 space-y-4">
        {/* 次の目標 */}
        <div
          className="card money-goal-hero p-5 anim-fadeInUp"
          style={{ background: `linear-gradient(168deg, ${MONEY_ACCENT_BG}, var(--surface) 62%)` }}
        >
          {!info ? (
            <>
              <p className="text-[11.5px] font-bold tracking-widest" style={{ color: 'var(--sub)' }}>次の目標</p>
              <p className="text-xs mt-2.5 leading-relaxed" style={{ color: 'var(--sub)' }}>
                これから先の目標がありません。<br />「＋ 追加」から登録できます
              </p>
            </>
          ) : (
            <>
              <p className="text-[11.5px] font-bold tracking-widest" style={{ color: 'var(--sub)' }}>次の目標</p>
              <p className="text-[13px] font-bold mt-2" style={{ color: MONEY_ACCENT }}>
                {formatMonthLabel(info.goal.month)}まで
              </p>
              <p
                className="text-[38px] leading-tight font-semibold font-serif-num mt-0.5"
                style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
              >
                {formatYen(info.goal.amount)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{info.goal.name}</p>

              <div
                className="h-2.5 rounded-md overflow-hidden mt-4 mb-2"
                style={{ background: 'var(--surface-2)' }}
                role="img"
                aria-label={`目標 ${formatYen(info.goal.amount)} のうち ${formatYen(info.current)} 達成`}
              >
                <div
                  className="h-full rounded-md transition-[width] duration-300"
                  style={{ width: `${pct}%`, background: info.pace === 'done' ? 'var(--safe)' : MONEY_ACCENT }}
                />
              </div>
              <div className="flex justify-between text-[11.5px]" style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                <span>達成率 {ratioPercent(info.ratio)}%</span>
                <span>残り {info.monthsLeft}か月</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                {[{ k: '現在', v: info.current }, { k: 'あと', v: info.remaining }].map(cell => (
                  <div key={cell.k} className="rounded-2xl px-2.5 py-3" style={{ background: 'var(--bg)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--sub)' }}>{cell.k}</p>
                    <p className="text-[18px] font-bold font-serif-num mt-0.5" style={{ color: 'var(--ink)' }}>
                      {formatYen(cell.v)}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <span
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 rounded-full text-[12.5px] font-bold"
                  style={paceStyle}
                >
                  <MoneyIcon name={info?.pace === 'done' ? 'check' : 'roadmap'} /> {pace!.label}
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--sub)' }}>{pace!.note}</p>

              {info.remaining > 0 && (
                <p
                  className="mt-3.5 px-3.5 py-2.5 rounded-2xl text-[12.5px] font-semibold"
                  style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}
                >
                  目標達成には、ここから月平均{' '}
                  <b className="text-[15px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatYen(info.perMonth)}
                  </b>
                </p>
              )}
            </>
          )}
        </div>

        {/* 目標の一覧（縦のタイムライン） */}
        <div className="card p-5 anim-fadeInUp">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-sm font-medium" style={{ color: 'var(--sub)' }}>目標の一覧</p>
            <button onClick={() => openForm(null)} className="text-xs font-semibold" style={{ color: MONEY_ACCENT }}>
              ＋ 追加
            </button>
          </div>

          {list.length === 0 ? (
            <p className="text-xs text-center py-2.5" style={{ color: 'var(--muted)' }}>目標がまだありません</p>
          ) : (
            list.map((m, i) => {
              const isEvent = m.kind === 'event';
              const done = isMilestoneDone(m, current);
              const isCurrent = info?.goal.id === m.id;
              return (
                <div key={m.id} className="flex gap-3">
                  <div className="w-[22px] shrink-0 flex flex-col items-center">
                    <div
                      className="w-[13px] h-[13px] rounded-full shrink-0 mt-[3px] flex items-center justify-center text-[8px] leading-none text-white"
                      style={{
                        border: `2px solid ${isEvent ? 'var(--sub)' : done || isCurrent ? MONEY_ACCENT : 'var(--line)'}`,
                        background: done ? MONEY_ACCENT : isEvent ? 'var(--surface-2)' : 'var(--surface)',
                        boxShadow: isCurrent ? `0 0 0 4px ${MONEY_ACCENT_BG}` : 'none',
                      }}
                    >
                      {done ? '✓' : ''}
                    </div>
                    {i < list.length - 1 && (
                      <div className="flex-1 w-0.5 my-[3px] min-h-[14px]" style={{ background: 'var(--line)' }} />
                    )}
                  </div>

                  <div
                    className="flex-1 min-w-0 pb-4"
                    style={isCurrent
                      ? { background: MONEY_ACCENT_BG, borderRadius: 14, padding: '10px 12px', marginBottom: 16, paddingBottom: 10 }
                      : undefined}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11.5px] font-semibold" style={{ color: isCurrent ? MONEY_ACCENT : 'var(--muted)' }}>
                          {formatMonthLabel(m.month)}{isCurrent && '・いま向かっている目標'}
                        </p>
                        <p
                          className="text-[17px] font-bold mt-px"
                          style={{
                            color: isEvent ? 'var(--sub)' : done ? 'var(--sub)' : isCurrent ? 'var(--ink)' : 'var(--muted)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {isEvent ? `🚙 −${formatYen(m.amount)}` : formatMan(m.amount)}
                        </p>
                        <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--muted)' }}>
                          {m.name}{done && '・達成'}
                        </p>
                      </div>
                      <button
                        onClick={() => openForm(m)}
                        className="text-sm px-1.5 -mt-1 -mr-1.5 shrink-0"
                        style={{ color: 'var(--muted)' }}
                        aria-label={`${m.name}を編集`}
                      >
                        <MoneyIcon name="edit" />
                      </button>
                    </div>
                    {isEvent && typeof m.after === 'number' && (
                      <p
                        className="text-[11.5px] mt-1.5 pt-1.5"
                        style={{ color: 'var(--sub)', borderTop: '1px dashed var(--line)' }}
                      >
                        購入後の目標残高 {formatYen(m.after)}（計画された支出です）
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="text-[11px] text-center pb-2" style={{ color: 'var(--muted)' }}>
          目標はいつでも追加・変更できます
        </p>
      </div>

      {/* 目標の追加・編集 */}
      <BottomSheet open={form !== null} onClose={() => setForm(null)} title={form?.id ? '目標を編集' : '目標を追加'}>
        {form && (
          <>
            <div className="space-y-4">
              <div>
                <label className="field-label">種類</label>
                <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'var(--surface-2)' }} role="group" aria-label="目標の種類">
                  {([['goal', '貯金の目標'], ['event', '大きな支出']] as const).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={form.kind === k}
                      onClick={() => setForm({ ...form, kind: k })}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                      style={form.kind === k
                        ? { background: 'var(--surface-2)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                        : { color: 'var(--muted)' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>
                  {form.kind === 'event'
                    ? 'レクサス購入など、あらかじめ計画された大きな支出です'
                    : 'その時点で到達したい貯金額を登録します'}
                </p>
              </div>

              <div>
                <label className="field-label" htmlFor="rm-name">名前 *</label>
                <input
                  id="rm-name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="例：貯金 150万円・レクサス購入"
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="rm-month">目標の年月 *</label>
                <input
                  id="rm-month"
                  type="month"
                  value={form.month}
                  onChange={e => setForm({ ...form, month: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="rm-amount">
                  {form.kind === 'event' ? '支出する金額 *' : '目標の貯金額 *'}
                </label>
                {moneyField(form.amount, raw => setForm({ ...form, amount: raw }), '150,000', 'rm-amount')}
              </div>

              {form.kind === 'event' && (
                <div>
                  <label className="field-label" htmlFor="rm-after">購入後に残す貯金額</label>
                  {moneyField(form.after, raw => setForm({ ...form, after: raw }), '1,475,000', 'rm-after')}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {form.id && (
                <button
                  id="rm-delete"
                  onClick={deleteForm}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white"
                  style={{ background: MONEY_DANGER }}
                >
                  削除
                </button>
              )}
              <button
                onClick={() => setForm(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--sub)' }}
              >
                キャンセル
              </button>
              <button
                id="rm-save"
                onClick={saveForm}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white"
                style={{ background: MONEY_ACCENT }}
              >
                {form.id ? '保存する' : '追加する'}
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      {/* 対象残高の設定 */}
      <BottomSheet open={sourceOpen} onClose={() => setSourceOpen(false)} title="ロードマップ対象残高">
        <p className="text-[11px] mb-3" style={{ color: 'var(--muted)' }}>どのお金を貯金として数えるかを決めます</p>

        <div className="flex gap-1.5 p-1 rounded-2xl mb-4" style={{ background: 'var(--surface-2)' }} role="group" aria-label="対象残高の決め方">
          {([['accounts', '口座から'], ['manual', '手入力']] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={roadmap.source === k}
              onClick={() => update({ source: k })}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
              style={roadmap.source === k
                ? { background: 'var(--surface-2)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: 'var(--muted)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {roadmap.source === 'accounts' ? (
          <div>
            <label className="field-label">対象にする口座</label>
            {accounts.length === 0 ? (
              <p className="text-xs text-center py-2.5" style={{ color: 'var(--muted)' }}>口座が登録されていません</p>
            ) : (
              accounts.map(a => (
                <div key={a.id} data-rm-acc={a.id} data-on={picked.includes(a.id)}>
                  <BudgetToggle
                    on={picked.includes(a.id)}
                    accent={MONEY_ACCENT}
                    onChange={() => toggleAccount(a.id)}
                    label={`${a.name}（${formatYen(accountAmount(a))}）`}
                  />
                </div>
              ))
            )}
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>
              {roadmap.accountIds.length === 0
                ? '未選択のあいだは「使っていいお金の計算に含めない口座」を貯金として数えます'
                : `選んだ口座の合計 ${formatYen(current)} を貯金として数えます`}
            </p>
          </div>
        ) : (
          <div>
            <label className="field-label" htmlFor="rm-manual">貯金額</label>
            {moneyField(roadmap.manual, raw => update({ manual: raw }), '71,609', 'rm-manual')}
          </div>
        )}

        <div className="mt-4">
          <label className="field-label" htmlFor="rm-start-month">ペース判定の起点</label>
          <input
            id="rm-start-month"
            type="month"
            value={roadmap.startMonth}
            onChange={e => update({ startMonth: e.target.value || thisMonth() })}
            className="input"
          />
          <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>
            最初の目標に向かうペースを、この時点からの直線で見ます
          </p>
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="rm-start-amount">起点の貯金額</label>
          {moneyField(roadmap.startAmount, raw => update({ startAmount: raw }), '0', 'rm-start-amount')}
        </div>

        <button
          id="rm-source-done"
          onClick={() => setSourceOpen(false)}
          className="w-full py-3.5 rounded-2xl text-sm font-medium text-white mt-6"
          style={{ background: MONEY_ACCENT }}
        >
          閉じる
        </button>
      </BottomSheet>
    </div>
  );
}
