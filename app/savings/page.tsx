'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { Savings } from '@/types';
import { formatYen } from '@/lib/utils';
import { XP_REWARDS } from '@/lib/game';

const DEFAULT: Savings = { goal: 0, current: 0 };
const QUICK = [500, 1000, 3000, 5000, 10000];

export default function SavingsPage() {
  const [savings, setSavings, loaded] = useLocalStorage<Savings>('oshi-savings', DEFAULT);
  const { addXP } = useGameState();
  const [editMode, setEditMode] = useState(false);
  const [goalInput, setGoalInput]     = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [addInput, setAddInput]       = useState('');

  if (!loaded) return null;

  const pct       = savings.goal > 0 ? Math.min((savings.current / savings.goal) * 100, 100) : 0;
  const remaining = Math.max(savings.goal - savings.current, 0);
  const r         = 72;
  const circ      = 2 * Math.PI * r;
  const dash      = circ - (pct / 100) * circ;

  const saveSettings = () => {
    const g = parseInt(goalInput)    || savings.goal;
    const c = parseInt(currentInput) || savings.current;
    setSavings({ goal: g, current: Math.min(c, g) });
    setEditMode(false);
    setGoalInput('');
    setCurrentInput('');
  };

  const quickAdd = (amt: number) => {
    setSavings(prev => ({
      ...prev,
      current: Math.min(prev.current + amt, prev.goal || prev.current + amt),
    }));
    addXP(XP_REWARDS.SAVINGS_UPDATE);
  };

  const customAdd = () => {
    const a = parseInt(addInput);
    if (!a || a <= 0) return;
    quickAdd(a);
    setAddInput('');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-8 pb-5 flex items-end justify-between">
        <div className="anim-fadeIn">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Savings</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>推し活貯金</h1>
        </div>
        <button
          onClick={() => { setEditMode(true); setGoalInput(String(savings.goal||'')); setCurrentInput(String(savings.current||'')); }}
          className="text-xs font-medium px-4 py-2 rounded-full transition-all active:scale-95 anim-fadeIn"
          style={{ background: `rgba(var(--accent),0.12)`, color: `rgb(var(--accent))` }}
        >
          設定を変更
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* SVG Circle + amount */}
        <div className="card p-8 flex flex-col items-center anim-scaleIn">
          <div className="relative">
            <svg width="184" height="184" viewBox="0 0 184 184">
              {/* Track */}
              <circle cx="92" cy="92" r={r} fill="none" stroke="#F0EBE6" strokeWidth="10" />
              {/* Fill */}
              <circle
                cx="92" cy="92" r={r}
                fill="none"
                stroke={`rgb(var(--accent))`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dash}
                transform="rotate(-90 92 92)"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
              />
              {/* Glow ring */}
              {pct > 0 && (
                <circle
                  cx="92" cy="92" r={r}
                  fill="none"
                  stroke={`rgba(var(--accent),0.15)`}
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dash}
                  transform="rotate(-90 92 92)"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
                />
              )}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold font-serif-num" style={{ color: '#1C1917' }}>
                {Math.round(pct)}%
              </span>
              <span className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>達成</span>
            </div>
          </div>

          <div className="text-center mt-4 space-y-0.5">
            <p className="text-[28px] font-semibold font-serif-num" style={{ color: '#1C1917', letterSpacing: '-0.02em' }}>
              {formatYen(savings.current)}
            </p>
            <p className="text-sm" style={{ color: '#A8A29E' }}>/ {formatYen(savings.goal)} 目標</p>
          </div>

          {/* Sub info */}
          {savings.goal > 0 && pct < 100 && (
            <div
              className="mt-5 px-5 py-3 rounded-2xl w-full text-center"
              style={{ background: `rgba(var(--accent),0.08)` }}
            >
              <p className="text-sm font-medium" style={{ color: `rgb(var(--accent))` }}>
                あと {formatYen(remaining)} で夢が叶う ✨
              </p>
            </div>
          )}
          {pct >= 100 && (
            <div
              className="mt-5 px-5 py-3 rounded-2xl w-full text-center"
              style={{ background: `rgba(var(--accent),0.08)` }}
            >
              <p className="text-sm font-medium" style={{ color: `rgb(var(--accent))` }}>
                🎉 目標達成！おめでとう！
              </p>
            </div>
          )}
          {savings.goal === 0 && (
            <p className="text-sm mt-4" style={{ color: '#A8A29E' }}>「設定を変更」から目標金額を入力してね</p>
          )}
        </div>

        {/* Quick add */}
        <div className="card p-5 anim-fadeInUp stagger-1">
          <p className="text-sm font-medium mb-4" style={{ color: '#78716C' }}>貯金を追加</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK.map(amt => (
              <button
                key={amt}
                onClick={() => quickAdd(amt)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-90"
                style={{
                  background: `rgba(var(--accent),0.1)`,
                  color: `rgb(var(--accent))`,
                }}
              >
                +{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
              <input
                type="number"
                value={addInput}
                onChange={e => setAddInput(e.target.value)}
                placeholder="任意の金額"
                className="input pl-8"
              />
            </div>
            <button
              onClick={customAdd}
              className="px-5 py-3 rounded-xl text-sm font-medium text-white active:scale-95 transition-transform"
              style={{ background: `rgb(var(--accent))` }}
            >
              追加
            </button>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editMode && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(28,18,12,0.4)' }}
          onClick={() => setEditMode(false)}
        >
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#E0D8D2' }} />
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#1C1917' }}>貯金を設定</h2>

            <div className="space-y-4">
              <div>
                <label className="field-label">目標金額</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
                  <input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)} placeholder={String(savings.goal||0)} className="input pl-8" />
                </div>
              </div>
              <div>
                <label className="field-label">現在の金額</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
                  <input type="number" value={currentInput} onChange={e => setCurrentInput(e.target.value)} placeholder={String(savings.current||0)} className="input pl-8" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditMode(false)} className="flex-1 py-3.5 rounded-2xl text-sm font-medium" style={{ background: '#F0EBE6', color: '#78716C' }}>キャンセル</button>
              <button onClick={saveSettings} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white" style={{ background: `rgb(var(--accent))` }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
