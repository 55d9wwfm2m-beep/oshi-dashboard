'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { OshiEvent, EventType, EVENT_TYPES, EVENT_TYPE_EMOJI } from '@/types';
import { daysUntil, formatDate, generateId, todayString } from '@/lib/utils';
import { XP_REWARDS } from '@/lib/game';
import Field from '@/components/ui/Field';
import BottomSheet from '@/components/ui/BottomSheet';

const EMPTY = { name: '', date: '', venue: '', memo: '', type: 'ライブ' as EventType };

export default function EventsPage() {
  const [events, setEvents, loaded] = useLocalStorage<OshiEvent[]>('oshi-events', []);
  const { addXP } = useGameState();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState(EMPTY);
  const [tab, setTab]           = useState<'upcoming' | 'past'>('upcoming');
  const [typeFilter, setTypeFilter] = useState<EventType | 'すべて'>('すべて');

  if (!loaded) return null;

  const allUpcoming = events.filter(e => daysUntil(e.date) >= 0).sort((a,b) => a.date.localeCompare(b.date));
  const allPast     = events.filter(e => daysUntil(e.date) <  0).sort((a,b) => b.date.localeCompare(a.date));

  const applyFilter = (arr: OshiEvent[]) =>
    typeFilter === 'すべて' ? arr : arr.filter(e => (e.type ?? 'ライブ') === typeFilter);

  const list = applyFilter(tab === 'upcoming' ? allUpcoming : allPast);

  const save = () => {
    if (!form.name || !form.date) return;
    if (editId) {
      setEvents(prev => prev.map(e => e.id === editId ? { ...e, ...form } : e));
    } else {
      setEvents(prev => [...prev, { id: generateId(), ...form }]);
      addXP(XP_REWARDS.EVENT_CREATE);
    }
    setForm(EMPTY);
    setEditId(null);
    setShowForm(false);
  };
  const startEdit = (ev: OshiEvent) => {
    setForm({ name: ev.name, date: ev.date, venue: ev.venue, memo: ev.memo, type: ev.type ?? 'ライブ' });
    setEditId(ev.id);
    setShowForm(true);
  };
  const del = (id: string) => { if (confirm('削除しますか？')) setEvents(prev => prev.filter(e => e.id !== id)); };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 flex items-end justify-between anim-fadeIn">
        <div>
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Events</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>イベント</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY); setEditId(null); }}
          aria-label="イベントを追加"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl shadow-md active:scale-90 transition-transform"
          style={{ background: `rgb(var(--accent))` }}
        >
          +
        </button>
      </div>

      {/* Event type filter */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['すべて', ...EVENT_TYPES] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="shrink-0 text-xs px-3.5 py-1.5 rounded-full font-medium transition-all"
              style={typeFilter === t
                ? { background: 'rgb(var(--accent))', color: 'white' }
                : { background: 'white', color: '#78716C', border: '1px solid #EDE8E3' }
              }
            >
              {t === 'すべて' ? 'すべて' : `${EVENT_TYPE_EMOJI[t as EventType]} ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming / Past tabs */}
      <div className="px-4 mb-5">
        <div className="flex bg-[#F0EBE6] rounded-2xl p-1">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-xs font-medium rounded-xl transition-all"
              style={tab === t
                ? { background: 'white', color: '#1C1917', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: '#A8A29E' }
              }
            >
              {t === 'upcoming' ? `これから  ${allUpcoming.length}` : `過去  ${allPast.length}`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-3">
        {list.length === 0 && (
          <div className="text-center py-20 space-y-3 anim-fadeIn">
            <p className="text-4xl">🗓</p>
            <p className="text-sm" style={{ color: '#A8A29E' }}>
              {tab === 'upcoming' ? 'まだ予定がありません' : '過去のイベントがありません'}
            </p>
          </div>
        )}

        {list.map((ev, i) => {
          const days    = daysUntil(ev.date);
          const evType  = ev.type ?? 'ライブ';
          return (
            <div
              key={ev.id}
              className="card overflow-hidden anim-fadeInUp"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="h-0.5"
                style={{
                  background: days >= 0
                    ? `linear-gradient(90deg, rgb(var(--accent)), transparent)`
                    : '#F0EBE6',
                }}
              />
              <div className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Type badge */}
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5 inline-block"
                      style={{ background: 'rgba(var(--accent),0.1)', color: 'rgb(var(--accent))' }}
                    >
                      {EVENT_TYPE_EMOJI[evType]} {evType}
                    </span>
                    <h3 className="font-semibold text-[17px] leading-snug" style={{ color: '#1C1917' }}>
                      {ev.name}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>
                      {formatDate(ev.date)}
                      {ev.venue && <span>　·　{ev.venue}</span>}
                    </p>
                    {ev.memo && (
                      <p className="text-xs mt-1.5 italic" style={{ color: '#B8B0A8' }}>{ev.memo}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {days === 0 ? (
                      <span
                        className="text-sm font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `rgba(var(--accent),0.12)`, color: `rgb(var(--accent))` }}
                      >
                        今日！🎉
                      </span>
                    ) : days > 0 ? (
                      <>
                        <p className="text-3xl font-semibold font-serif-num" style={{ color: `rgb(var(--accent))` }}>{days}</p>
                        <p className="text-[11px]" style={{ color: '#A8A29E' }}>日後</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-semibold font-serif-num" style={{ color: '#C8C0BA' }}>{Math.abs(days)}</p>
                        <p className="text-[11px]" style={{ color: '#A8A29E' }}>日前</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="ticket-divider mt-4 mb-3">
                  <div className="ticket-hole left-0" />
                  <div className="ticket-hole right-0" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#A8A29E' }}>
                    {days >= 0 ? `📍 ${ev.venue || '場所未定'}` : `✓ 参加済み`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(ev)}
                      className="text-[11px] px-3 py-2 -my-2 rounded-lg transition-colors"
                      style={{ color: '#A8A29E' }}
                      aria-label={`${ev.name}を編集`}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => del(ev.id)}
                      className="text-[11px] px-3 py-2 -my-2 -mr-3 rounded-lg transition-colors active:text-red-400"
                      style={{ color: '#D0C8C2' }}
                      aria-label={`${ev.name}を削除`}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom sheet form */}
      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title={editId ? 'イベントを編集' : 'イベントを追加'}>

            <div className="space-y-4">
              {/* Type selection */}
              <div>
                <label className="field-label">種別</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(p => ({ ...p, type: t }))}
                      className="px-3 py-1.5 rounded-xl text-sm font-medium border transition-all active:scale-95"
                      style={form.type === t
                        ? { background: 'rgb(var(--accent))', color: 'white', border: 'none' }
                        : { background: 'white', color: '#78716C', borderColor: '#EDE8E3' }
                      }
                    >
                      {EVENT_TYPE_EMOJI[t]} {t}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="イベント名 *" value={form.name} onChange={v => setForm(p => ({...p, name: v}))} placeholder="例：サマーツアー東京公演" />
              <Field label="日付 *" type="date" value={form.date} onChange={v => setForm(p => ({...p, date: v}))} />
              <Field label="場所" value={form.venue} onChange={v => setForm(p => ({...p, venue: v}))} placeholder="例：武道館" />
              <Field label="メモ" value={form.memo} onChange={v => setForm(p => ({...p, memo: v}))} placeholder="備忘録など" />
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
                disabled={!form.name || !form.date}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white shadow-md disabled:opacity-40 active:scale-[0.98]"
                style={{ background: `rgb(var(--accent))` }}
              >
                {editId ? '保存する' : '追加する'}
              </button>
            </div>
      </BottomSheet>
    </div>
  );
}
