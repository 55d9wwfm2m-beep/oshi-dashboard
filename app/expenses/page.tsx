'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES, CATEGORY_EMOJI, CATEGORY_COLOR } from '@/types';
import { formatYen, formatDate, generateId, todayString, getCurrentMonth, getCurrentYear } from '@/lib/utils';
import { XP_REWARDS } from '@/lib/game';

const EMPTY: Omit<Expense,'id'> = { date: todayString(), amount: 0, category: 'その他', description: '' };

export default function ExpensesPage() {
  const [expenses, setExpenses, loaded] = useLocalStorage<Expense[]>('oshi-expenses', []);
  const { addXP } = useGameState();
  const [tab, setTab]       = useState<'list'|'stats'>('list');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]     = useState({ ...EMPTY, date: todayString() });
  const [amtInput, setAmtInput] = useState('');
  const [filter, setFilter] = useState<ExpenseCategory|'すべて'>('すべて');
  const [editId, setEditId] = useState<string | null>(null);

  if (!loaded) return null;

  const currentMonth = getCurrentMonth();
  const currentYear  = getCurrentYear();
  const monthly = expenses.filter(e => e.date.startsWith(currentMonth));
  const yearly  = expenses.filter(e => e.date.startsWith(String(currentYear)));
  const mTotal  = monthly.reduce((s,e) => s + e.amount, 0);
  const yTotal  = yearly.reduce((s,e) => s + e.amount, 0);

  const filtered = filter === 'すべて' ? expenses : expenses.filter(e => e.category === filter);
  const list = [...filtered].sort((a,b) => b.date.localeCompare(a.date));

  const catTotals = EXPENSE_CATEGORIES
    .map(cat => ({ cat, total: expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0) }))
    .filter(c => c.total > 0)
    .sort((a,b) => b.total - a.total);
  const maxCat = Math.max(...catTotals.map(c=>c.total), 1);

  const addExpense = () => {
    const amt = parseInt(amtInput);
    if (!form.date || !amt || amt <= 0) return;
    if (editId) {
      setExpenses(prev => prev.map(e => e.id === editId ? { ...e, ...form, amount: amt } : e));
    } else {
      setExpenses(prev => [{ id: generateId(), ...form, amount: amt }, ...prev]);
      addXP(XP_REWARDS.EXPENSE_CREATE);
    }
    setForm({ ...EMPTY, date: todayString() });
    setAmtInput('');
    setEditId(null);
    setShowForm(false);
  };
  const startEdit = (exp: Expense) => {
    setForm({ date: exp.date, amount: exp.amount, category: exp.category, description: exp.description });
    setAmtInput(String(exp.amount));
    setEditId(exp.id);
    setShowForm(true);
  };
  const del = (id:string) => { if (confirm('削除しますか？')) setExpenses(prev => prev.filter(e=>e.id!==id)); };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-8 pb-5 flex items-end justify-between">
        <div className="anim-fadeIn">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Expenses</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>推し活支出</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm({...EMPTY, date: todayString()}); setAmtInput(''); setEditId(null); }}
          aria-label="支出を記録"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl shadow-md active:scale-90 transition-transform anim-fadeIn"
          style={{ background: `rgb(var(--accent))` }}
        >
          +
        </button>
      </div>

      {/* Summary cards */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        {[
          { label: '今月', val: mTotal },
          { label: '今年', val: yTotal },
        ].map((item,i) => (
          <div
            key={item.label}
            className="card p-4 anim-fadeInUp"
            style={{ animationDelay: `${i*60}ms` }}
          >
            <p className="text-[11px] font-medium tracking-wider uppercase" style={{ color: '#A8A29E' }}>{item.label}の支出</p>
            <p
              className="text-2xl font-semibold font-serif-num mt-1"
              style={{ color: '#1C1917', letterSpacing: '-0.02em' }}
            >
              {formatYen(item.val)}
            </p>
          </div>
        ))}
      </div>

      {/* やりくり電卓への導線 */}
      <div className="px-4 mb-4">
        <Link
          href="/money"
          className="card card-hover p-4 flex items-center gap-3 anim-fadeInUp stagger-2 active:scale-[0.985]"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: 'rgba(53,146,119,0.10)' }}
          >
            💰
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: '#1C1917' }}>使っていいお金を計算</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>所持金から未払いの固定費を引いてすぐ確認</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth={2} className="w-4 h-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-[#F0EBE6] rounded-2xl p-1">
          {(['list','stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 text-xs font-medium rounded-xl transition-all"
              style={tab===t ? { background:'white', color:'#1C1917', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' } : { color:'#A8A29E' }}
            >
              {t === 'list' ? '記録' : '統計'}
            </button>
          ))}
        </div>
      </div>

      {/* List tab */}
      {tab === 'list' && (
        <div className="px-4 space-y-3">
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['すべて', ...EXPENSE_CATEGORIES] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="shrink-0 text-xs px-3.5 py-1.5 rounded-full font-medium transition-all"
                style={filter === cat
                  ? { background:`rgb(var(--accent))`, color:'white' }
                  : { background:'white', color:'#78716C', border:'1px solid #EDE8E3' }
                }
              >
                {cat === 'すべて' ? 'すべて' : `${CATEGORY_EMOJI[cat as ExpenseCategory]} ${cat}`}
              </button>
            ))}
          </div>

          {list.length === 0 && (
            <div className="text-center py-16 px-8 space-y-3 anim-fadeIn">
              <p className="text-5xl">💸</p>
              <p className="text-base font-medium" style={{ color: '#78716C' }}>
                {filter === 'すべて' ? 'まだ支出の記録がありません' : `「${filter}」の記録はまだありません`}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
                グッズや遠征の支出を記録すると<br />推し活にかけた金額がひと目で分かるよ
              </p>
              <button
                onClick={() => { setShowForm(true); setForm({...EMPTY, date: todayString()}); setAmtInput(''); setEditId(null); }}
                className="inline-block mt-2 px-6 py-3 rounded-full text-sm font-semibold active:scale-95 transition-transform"
                style={{ background: 'rgb(var(--accent))', color: 'white' }}
              >
                ＋ 最初の支出を記録
              </button>
            </div>
          )}

          {list.map((exp, i) => (
            <div
              key={exp.id}
              className="card p-4 flex items-center gap-3 anim-fadeInUp"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: `${CATEGORY_COLOR[exp.category]}18` }}
              >
                {CATEGORY_EMOJI[exp.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#1C1917' }}>
                  {exp.description || exp.category}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px]" style={{ color: '#A8A29E' }}>{formatDate(exp.date)}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background:`${CATEGORY_COLOR[exp.category]}18`, color:CATEGORY_COLOR[exp.category] }}
                  >
                    {exp.category}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>{formatYen(exp.amount)}</p>
                <button onClick={() => startEdit(exp)} className="text-[11px] mt-0.5 px-2 py-1.5 -my-1 rounded-lg" style={{ color: '#A8A29E' }} aria-label="この支出を編集">
                  編集
                </button>
                <button onClick={() => del(exp.id)} className="text-[11px] mt-0.5 px-2 py-1.5 -my-1 rounded-lg active:text-red-400 transition-colors" style={{ color: '#D0C8C2' }} aria-label="この支出を削除">
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="px-4 space-y-4">
          {/* Category breakdown */}
          <div className="card p-5 anim-fadeIn">
            <p className="text-sm font-medium mb-4" style={{ color: '#78716C' }}>カテゴリ別</p>
            {catTotals.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#A8A29E' }}>データがありません</p>
            ) : catTotals.map(({ cat, total }) => (
              <div key={cat} className="mb-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium" style={{ color: '#1C1917' }}>{CATEGORY_EMOJI[cat]} {cat}</span>
                  <span className="font-semibold" style={{ color: '#1C1917' }}>{formatYen(total)}</span>
                </div>
                <div className="progress-track h-1.5">
                  <div
                    className="progress-fill"
                    style={{ width: `${(total/maxCat)*100}%`, background: CATEGORY_COLOR[cat] }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Monthly trend */}
          <div className="card p-5 anim-fadeIn stagger-1">
            <p className="text-sm font-medium mb-4" style={{ color: '#78716C' }}>月別推移</p>
            {(() => {
              const byMonth: Record<string,number> = {};
              expenses.forEach(e => { const k = e.date.slice(0,7); byMonth[k]=(byMonth[k]||0)+e.amount; });
              const sorted = Object.entries(byMonth).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,6);
              if (!sorted.length) return <p className="text-sm text-center py-2" style={{ color:'#A8A29E' }}>データがありません</p>;
              const max = Math.max(...sorted.map(([,v])=>v), 1);
              return sorted.map(([month, total]) => (
                <div key={month} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color:'#78716C' }}>{month.replace('-','年')}月</span>
                    <span className="font-medium" style={{ color:'#1C1917' }}>{formatYen(total)}</span>
                  </div>
                  <div className="progress-track h-1.5">
                    <div className="progress-fill" style={{ width:`${(total/max)*100}%` }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Bottom sheet form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background:'rgba(28,18,12,0.4)' }} onClick={() => setShowForm(false)}>
          <div className="bottom-sheet" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background:'#E0D8D2' }} />
            <h2 className="text-lg font-semibold mb-5" style={{ color:'#1C1917' }}>{editId ? '支出を編集' : '支出を記録'}</h2>

            <div className="space-y-4">
              <div>
                <label className="field-label">金額 *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color:'#A8A29E' }}>¥</span>
                  <input type="number" value={amtInput} onChange={e=>setAmtInput(e.target.value)} placeholder="0" className="input pl-8" />
                </div>
              </div>

              <div>
                <label className="field-label">カテゴリ</label>
                <div className="flex flex-wrap gap-2">
                  {EXPENSE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm({...form, category: cat})}
                      className="px-3 py-1.5 rounded-xl text-sm font-medium border transition-all active:scale-95"
                      style={form.category===cat
                        ? { background: CATEGORY_COLOR[cat], color:'white', borderColor: CATEGORY_COLOR[cat] }
                        : { background:'white', color:'#78716C', borderColor:'#EDE8E3' }
                      }
                    >
                      {CATEGORY_EMOJI[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">日付</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input" />
              </div>

              <div>
                <label className="field-label">内容</label>
                <input type="text" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="例：会場限定グッズ" className="input" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3.5 rounded-2xl text-sm font-medium" style={{ background:'#F0EBE6',color:'#78716C' }}>キャンセル</button>
              <button onClick={addExpense} disabled={!amtInput||parseInt(amtInput)<=0} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white disabled:opacity-40" style={{ background:`rgb(var(--accent))` }}>{editId ? '保存する' : '記録する'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
