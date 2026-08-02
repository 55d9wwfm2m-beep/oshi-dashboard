'use client';

import { useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OshiProfile, OshiEvent, AttendanceLog, Expense, CATEGORY_EMOJI } from '@/types';
import { formatDate, daysUntil } from '@/lib/utils';

interface Entry {
  date: string;
  title: string;
  sub?: string;
  icon: string;
  type: 'meet'|'event'|'log'|'expense'|'future';
  isToday?: boolean;
}

const DEFAULT_PROFILE: OshiProfile = { name:'', group:'', meetDate:'', birthday:'', photoUrl:'', themeColor:'196,164,160' };

const TYPE_META: Record<Entry['type'], { label: string; hue: string }> = {
  meet:    { label: '出会い',   hue: 'rgba(var(--accent),1)' },
  event:   { label: 'イベント', hue: '#A79CB5' },
  log:     { label: '参戦',     hue: '#8EAEC5' },
  expense: { label: '支出',     hue: '#B5A07A' },
  future:  { label: '予定',     hue: '#C8C0BA' },
};

export default function TimelinePage() {
  const [profile,,p1] = useLocalStorage<OshiProfile>('oshi-profile', DEFAULT_PROFILE);
  const [events, ,p2] = useLocalStorage<OshiEvent[]>('oshi-events', []);
  const [logs,   ,p3] = useLocalStorage<AttendanceLog[]>('oshi-logs', []);
  const [expenses,,p4]= useLocalStorage<Expense[]>('oshi-expenses', []);
  const scrollRef     = useRef<HTMLDivElement>(null);

  if (!p1||!p2||!p3||!p4) return null;

  const today = new Date().toISOString().slice(0,10);
  const past: Entry[] = [];
  const future: Entry[] = [];

  if (profile.meetDate) {
    past.push({ date: profile.meetDate, title:`${profile.name||'推し'}に出会う`, sub: profile.group||undefined, icon:'⭐', type:'meet' });
  }

  events.forEach(ev => {
    const d = daysUntil(ev.date);
    const isToday = ev.date === today;
    if (d < 0) past.push({ date: ev.date, title: ev.name, sub: ev.venue||undefined, icon:'🎵', type:'event' });
    else        future.push({ date: ev.date, title: ev.name, sub: ev.venue||undefined, icon:'🗓', type:'future', isToday });
  });

  logs.forEach(l => {
    past.push({ date: l.date, title: l.eventName, sub: l.seat||undefined, icon:'📸', type:'log' });
  });

  const seen = new Set<string>();
  [...expenses].sort((a,b)=>a.date.localeCompare(b.date)).forEach(e => {
    if (!seen.has(e.category)) {
      seen.add(e.category);
      past.push({ date: e.date, title:`初めての${e.category}`, sub: e.description||undefined, icon: CATEGORY_EMOJI[e.category], type:'expense' });
    }
  });

  const sorted = past.sort((a,b) => a.date.localeCompare(b.date));
  const allEntries = [...sorted, ...future.sort((a,b)=>a.date.localeCompare(b.date))];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-8 pb-3 anim-fadeIn">
        <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Timeline</p>
        <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>推し年表</h1>
        <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>
          {profile.name ? `${profile.name}との歩み` : '推しとの歩み'}
        </p>
      </div>

      {allEntries.length === 0 && (
        <div className="text-center py-20 px-8 space-y-3 anim-fadeIn">
          <p className="text-5xl">📖</p>
          <p className="text-base font-medium" style={{ color: '#78716C' }}>まだ年表がありません</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
            プロフィールの「出会った日」を設定したり<br />イベントや参戦ログを追加すると<br />年表が自動で作られます
          </p>
        </div>
      )}

      {allEntries.length > 0 && (
        <>
          {/* Horizontal scroll track */}
          <div
            ref={scrollRef}
            className="timeline-scroll px-4"
          >
            <div className="relative flex gap-0 pb-2" style={{ width: 'max-content', paddingTop: '48px' }}>
              {/* Connector line */}
              <div
                className="absolute left-0 right-0"
                style={{ top: 68, height: '1.5px', background: 'linear-gradient(90deg, transparent, #E8E2DC 5%, #E8E2DC 95%, transparent)' }}
              />

              {allEntries.map((entry, i) => {
                const isFuture = entry.type === 'future';
                const meta = TYPE_META[entry.type];
                const showYearBefore = i === 0 || entry.date.slice(0,4) !== allEntries[i-1].date.slice(0,4);

                return (
                  <div key={`${entry.date}-${entry.title}-${i}`} className="timeline-item px-2.5 first:pl-0">
                    {/* Year pill */}
                    {showYearBefore && (
                      <div
                        className="absolute text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          top: 0,
                          left: i === 0 ? 0 : undefined,
                          background: `rgba(var(--accent),0.12)`,
                          color: `rgb(var(--accent))`,
                        }}
                      >
                        {entry.date.slice(0,4)}年
                      </div>
                    )}

                    {/* Dot on line */}
                    <div className="flex justify-center mb-2" style={{ marginTop: 8 }}>
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shadow-sm"
                        style={{
                          borderColor: 'white',
                          background: isFuture ? '#E8E2DC' : meta.hue,
                          boxShadow: isFuture ? 'none' : `0 0 0 3px rgba(var(--accent),0.12)`,
                          zIndex: 1,
                        }}
                      />
                    </div>

                    {/* Entry card */}
                    <div
                      className="rounded-2xl p-3.5 transition-all"
                      style={{
                        background: isFuture ? 'rgba(248,245,242,0.8)' : 'white',
                        border: isFuture ? '1.5px dashed #E0DAD4' : '1px solid rgba(28,18,12,0.05)',
                        boxShadow: isFuture ? 'none' : '0 2px 12px rgba(28,18,12,0.06)',
                        opacity: isFuture ? 0.7 : 1,
                      }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-base leading-none">{entry.icon}</span>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{
                            background: isFuture ? '#F0EBE6' : `${meta.hue}18`,
                            color: isFuture ? '#A8A29E' : meta.hue,
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <p className="text-[11px] mb-0.5" style={{ color: '#A8A29E' }}>
                        {formatDate(entry.date)}
                        {entry.isToday && ' · 今日'}
                      </p>
                      <p
                        className="text-sm font-semibold leading-snug"
                        style={{ color: isFuture ? '#A8A29E' : '#1C1917' }}
                      >
                        {entry.title}
                      </p>
                      {entry.sub && (
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: '#A8A29E', maxWidth: 130 }}>
                          {entry.sub}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll hint */}
          {allEntries.length > 3 && (
            <p className="text-center text-[11px] mt-2 anim-fadeIn" style={{ color: '#C8C0BA' }}>
              ← スワイプして歴史を辿ろう →
            </p>
          )}

          {/* Vertical list below */}
          <div className="px-4 mt-8 space-y-3">
            <p className="text-xs font-medium tracking-wider uppercase" style={{ color: '#A8A29E' }}>全記録</p>
            {[...allEntries].reverse().map((entry, i) => {
              const isFuture = entry.type === 'future';
              const meta = TYPE_META[entry.type];
              return (
                <div
                  key={`v-${i}`}
                  className="flex items-start gap-3 anim-fadeInUp"
                  style={{ animationDelay: `${i * 40}ms`, opacity: isFuture ? 0.6 : 1 }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5"
                    style={{ background: isFuture ? '#F0EBE6' : `${meta.hue}18` }}
                  >
                    {entry.icon}
                  </div>
                  <div className="flex-1 pb-3" style={{ borderBottom: '1px solid rgba(28,18,12,0.05)' }}>
                    <p className="text-[11px]" style={{ color: '#A8A29E' }}>{formatDate(entry.date)}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: isFuture ? '#A8A29E' : '#1C1917' }}>
                      {entry.title}
                    </p>
                    {entry.sub && <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>{entry.sub}</p>}
                  </div>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 shrink-0"
                    style={{ background: isFuture ? '#F0EBE6' : `${meta.hue}18`, color: isFuture ? '#A8A29E' : meta.hue }}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
