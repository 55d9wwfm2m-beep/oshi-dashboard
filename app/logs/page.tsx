'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { AttendanceLog } from '@/types';
import { formatDate, formatDateShort, generateId, todayString } from '@/lib/utils';
import { XP_REWARDS } from '@/lib/game';

const EMPTY = { date: '', eventName: '', seat: '', impression: '' };

// Soft gradient backgrounds for log cards (cycle through these)
const CARD_BGSRC = [
  'linear-gradient(135deg, rgba(var(--accent),0.35) 0%, rgba(var(--accent),0.12) 100%)',
  'linear-gradient(135deg, rgba(167,156,181,0.35) 0%, rgba(167,156,181,0.12) 100%)',
  'linear-gradient(135deg, rgba(142,174,197,0.30) 0%, rgba(142,174,197,0.10) 100%)',
  'linear-gradient(135deg, rgba(181,160,122,0.35) 0%, rgba(181,160,122,0.12) 100%)',
  'linear-gradient(135deg, rgba(139,158,133,0.30) 0%, rgba(139,158,133,0.10) 100%)',
  'linear-gradient(135deg, rgba(189,140,122,0.30) 0%, rgba(189,140,122,0.10) 100%)',
];

export default function LogsPage() {
  const [logs, setLogs, loaded] = useLocalStorage<AttendanceLog[]>('oshi-logs', []);
  const { addXP } = useGameState();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY, date: todayString() });
  const [expanded, setExpanded] = useState<string|null>(null);

  if (!loaded) return null;

  const sorted = [...logs].sort((a,b) => b.date.localeCompare(a.date));
  const expandedLog = sorted.find(l => l.id === expanded);

  const add = () => {
    if (!form.date || !form.eventName) return;
    setLogs(prev => [{ id: generateId(), ...form }, ...prev]);
    addXP(XP_REWARDS.LOG_CREATE);
    setForm({ ...EMPTY, date: todayString() });
    setShowForm(false);
  };
  const del = (id: string) => {
    if (!confirm('削除しますか？')) return;
    setLogs(prev => prev.filter(l => l.id !== id));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-8 pb-5 flex items-end justify-between">
        <div className="anim-fadeIn">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Memories</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>参戦ログ</h1>
          {logs.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>{logs.length}件の思い出</p>
          )}
        </div>
        <button
          onClick={() => { setShowForm(true); setForm({ ...EMPTY, date: todayString() }); }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl shadow-md active:scale-90 transition-transform anim-fadeIn"
          style={{ background: `rgb(var(--accent))` }}
        >
          +
        </button>
      </div>

      {/* Empty */}
      {sorted.length === 0 && (
        <div className="text-center py-20 px-8 space-y-3 anim-fadeIn">
          <p className="text-5xl">📸</p>
          <p className="text-base font-medium" style={{ color: '#78716C' }}>まだ思い出がありません</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
            ライブや握手会、イベントの<br />思い出を残してみよう
          </p>
        </div>
      )}

      {/* Instagram-style 2-col grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {sorted.map((log, i) => (
          <button
            key={log.id}
            onClick={() => setExpanded(log.id)}
            className="relative rounded-3xl overflow-hidden text-left anim-fadeInUp"
            style={{
              aspectRatio: '1',
              animationDelay: `${i * 50}ms`,
              background: CARD_BGSRC[i % CARD_BGSRC.length],
              boxShadow: '0 2px 12px rgba(28,18,12,0.06)',
              border: '1px solid rgba(28,18,12,0.04)',
            }}
          >
            {/* Pattern decoration */}
            <div
              className="absolute top-3 right-3 text-4xl opacity-20 rotate-12 select-none pointer-events-none"
              aria-hidden
            >
              🎵
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 p-3"
              style={{
                background: 'linear-gradient(to top, rgba(20,14,10,0.7) 0%, transparent 100%)',
                paddingTop: '32px',
              }}
            >
              <p
                className="text-white font-medium text-[13px] leading-tight line-clamp-2"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
              >
                {log.eventName}
              </p>
              <p className="text-white/60 text-[10px] mt-0.5">{formatDateShort(log.date)}</p>
            </div>

            {/* Impression snippet (top) */}
            {log.impression && (
              <div className="absolute top-3 left-3 right-8">
                <p className="text-[11px] italic leading-relaxed line-clamp-2" style={{ color: 'rgba(28,18,12,0.55)' }}>
                  &ldquo;{log.impression}&rdquo;
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Expanded detail modal */}
      {expanded && expandedLog && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(28,18,12,0.5)' }}
          onClick={() => setExpanded(null)}
        >
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#E0D8D2' }} />

            {/* Accent strip */}
            <div className="h-0.5 rounded-full mb-5" style={{ background: `linear-gradient(90deg, rgb(var(--accent)), transparent)` }} />

            <p className="text-[11px] font-medium tracking-wider uppercase mb-1" style={{ color: '#A8A29E' }}>
              {formatDate(expandedLog.date)}
            </p>
            <h3 className="text-xl font-semibold leading-snug mb-1" style={{ color: '#1C1917' }}>
              {expandedLog.eventName}
            </h3>
            {expandedLog.seat && (
              <p className="text-sm mb-4" style={{ color: '#A8A29E' }}>🪑 {expandedLog.seat}</p>
            )}

            {expandedLog.impression && (
              <div
                className="rounded-2xl p-4 mb-4"
                style={{ background: '#FAF8F6', border: '1px solid rgba(28,18,12,0.06)' }}
              >
                <p
                  className="text-sm italic leading-relaxed"
                  style={{ color: '#78716C', whiteSpace: 'pre-wrap' }}
                >
                  &ldquo;{expandedLog.impression}&rdquo;
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setExpanded(null)}
                className="text-sm font-medium"
                style={{ color: '#A8A29E' }}
              >
                閉じる
              </button>
              <button
                onClick={() => del(expandedLog.id)}
                className="text-sm active:text-red-400 transition-colors"
                style={{ color: '#D0C8C2' }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(28,18,12,0.4)' }}
          onClick={() => setShowForm(false)}
        >
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#E0D8D2' }} />
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#1C1917' }}>参戦を記録する</h2>

            <div className="space-y-4">
              <div>
                <label className="field-label">日付</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input" />
              </div>
              <div>
                <label className="field-label">イベント名 *</label>
                <input type="text" value={form.eventName} onChange={e=>setForm({...form,eventName:e.target.value})} placeholder="例：ツアー東京公演" className="input" />
              </div>
              <div>
                <label className="field-label">座席</label>
                <input type="text" value={form.seat} onChange={e=>setForm({...form,seat:e.target.value})} placeholder="例：アリーナ A列 5番" className="input" />
              </div>
              <div>
                <label className="field-label">感想・思い出</label>
                <textarea
                  value={form.impression}
                  onChange={e=>setForm({...form,impression:e.target.value})}
                  placeholder="あの日の感動を書き留めておこう..."
                  rows={4}
                  className="input resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3.5 rounded-2xl text-sm font-medium" style={{ background:'#F0EBE6',color:'#78716C' }}>キャンセル</button>
              <button onClick={add} disabled={!form.date||!form.eventName} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white disabled:opacity-40" style={{ background:`rgb(var(--accent))` }}>記録する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
