'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { OshiProfile, OshiEvent, Savings, Expense, AttendanceLog } from '@/types';
import { daysSince, daysUntil, formatYen, formatDate, getCurrentMonth, todayString } from '@/lib/utils';
import { getXPProgress, getLevelTier, ACHIEVEMENTS, checkAchievement, XP_REWARDS } from '@/lib/game';
import Avatar from '@/components/Avatar';
import { useAvatarEquip } from '@/hooks/useAvatarEquip';

const DEFAULT_PROFILE: OshiProfile = {
  name: '', group: '', meetDate: '', birthday: '', photoUrl: '', themeColor: '196,164,160',
};
const DEFAULT_SAVINGS: Savings = { goal: 0, current: 0 };

export default function HomePage() {
  const [profile, , loaded] = useLocalStorage<OshiProfile>('oshi-profile', DEFAULT_PROFILE);
  const [events]      = useLocalStorage<OshiEvent[]>('oshi-events',  []);
  const [savings]     = useLocalStorage<Savings>('oshi-savings', DEFAULT_SAVINGS);
  const [expenses]    = useLocalStorage<Expense[]>('oshi-expenses', []);
  const [logs]        = useLocalStorage<AttendanceLog[]>('oshi-logs', []);
  const { equip: avatarConfig } = useAvatarEquip();
  const { state: gameState, addXP, markLogin, loaded: gameLoaded } = useGameState();

  // Daily login XP
  useEffect(() => {
    if (!gameLoaded) return;
    const today = todayString();
    if (gameState.lastLoginDate !== today) {
      addXP(XP_REWARDS.DAILY_LOGIN);
      markLogin(today);
    }
  }, [gameLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded || !gameLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-3xl animate-pulse" style={{ opacity: 0.3 }}>✦</span>
      </div>
    );
  }

  /* ── empty state ── */
  if (!profile.name) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Full-screen hero gradient */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-8 relative overflow-hidden"
          style={{
            background: `linear-gradient(160deg,
              rgba(var(--accent),0.22) 0%,
              rgba(var(--accent),0.06) 50%,
              transparent 100%)`,
          }}
        >
          {/* Bokeh dots */}
          {[
            { top:'12%', left:'20%', r:3 },
            { top:'25%', left:'78%', r:4 },
            { top:'55%', left:'12%', r:2 },
            { top:'70%', left:'80%', r:3 },
          ].map((d, i) => (
            <div key={i} style={{
              position:'absolute', top:d.top, left:d.left,
              width:d.r*2, height:d.r*2,
              borderRadius:'50%',
              background:'rgb(var(--accent))',
              opacity:0.3,
              boxShadow:`0 0 ${d.r*6}px ${d.r*3}px rgba(var(--accent),0.15)`,
            }}/>
          ))}

          <div className="text-center space-y-5 anim-fadeInUp px-8 relative z-10">
            {/* Large chibi avatar at level 1 */}
            <div className="flex justify-center mb-2">
              <Avatar level={1} size="lg" showItems={false} config={avatarConfig} />
            </div>
            <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: '#1C1917' }}>
              推し活ダッシュボード
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
              推しとの思い出・イベント・支出を<br />ひとつにまとめた、あなただけのホーム画面
            </p>
            <p className="text-xs" style={{ color: `rgb(var(--accent))` }}>
              レベルアップして推し活キャラを育てよう ✨
            </p>
          </div>

          <Link
            href="/profile"
            className="anim-fadeInUp stagger-2 px-12 py-4 rounded-full text-white text-sm font-semibold tracking-wider shadow-xl transition-transform active:scale-95 relative z-10"
            style={{
              background: `rgb(var(--accent))`,
              boxShadow: `0 8px 32px rgba(var(--accent),0.4)`,
            }}
          >
            はじめる →
          </Link>
        </div>
      </div>
    );
  }

  const xpProg = getXPProgress(gameState.xp);
  const tier   = getLevelTier(gameState.level);
  const checkData = { profile, events, logs, expenses, savings, gameState };
  const earnedCount = ACHIEVEMENTS.filter(a => checkAchievement(a.id, checkData)).length;

  const upcomingEvents = events
    .filter(e => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextEvent = upcomingEvents[0];

  const currentMonth = getCurrentMonth();
  const monthlyTotal = expenses
    .filter(e => e.date.startsWith(currentMonth))
    .reduce((s, e) => s + e.amount, 0);

  const savingsPct = savings.goal > 0
    ? Math.min(Math.round((savings.current / savings.goal) * 100), 100)
    : 0;
  const meetDays = profile.meetDate ? daysSince(profile.meetDate) : null;
  const nextDays  = nextEvent ? daysUntil(nextEvent.date) : null;

  const isBirthday = (() => {
    if (!profile.birthday) return false;
    const t = new Date();
    const b = new Date(profile.birthday + 'T00:00:00');
    return t.getMonth() === b.getMonth() && t.getDate() === b.getDate();
  })();

  return (
    <div className="min-h-screen">
      {/* ── HERO — full-width oshi photo ── */}
      <div
        className="anim-fadeIn"
        style={{
          position:     'relative',
          height:       'clamp(340px, 60vh, 500px)',
          overflow:     'hidden',
          borderRadius: '0 0 36px 36px',
        }}
      >
        {/* Background photo / gradient */}
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.name}
            style={{
              position:   'absolute', inset: 0,
              width:      '100%',     height: '100%',
              objectFit:  'cover',    objectPosition: profile.photoPosition || 'center 35%',
            }}
          />
        ) : (
          <div style={{
            position:   'absolute', inset: 0,
            background: `linear-gradient(160deg,
              rgba(var(--accent),0.90) 0%,
              rgba(var(--accent),0.55) 50%,
              rgba(160,140,125,0.75) 100%)`,
          }}/>
        )}

        {/* Stage-light halo from top (concert atmosphere) */}
        <div style={{
          position:   'absolute', inset: 0,
          background: `radial-gradient(ellipse 90% 45% at 50% -5%,
            rgba(var(--accent),0.40) 0%,
            transparent 70%)`,
          mixBlendMode: 'screen',
        }}/>

        {/* Cinematic dark gradient — bottom for text */}
        <div style={{
          position:   'absolute', inset: 0,
          background: `linear-gradient(to top,
            rgba(10,6,4,0.96) 0%,
            rgba(10,6,4,0.60) 35%,
            rgba(10,6,4,0.15) 65%,
            transparent 100%)`,
        }}/>

        {/* Bokeh dots */}
        {[
          { top:'10%', left:'18%', r:3 },
          { top:'22%', left:'72%', r:4 },
          { top:'40%', left:'8%',  r:2 },
          { top:'16%', left:'48%', r:2.5 },
          { top:'30%', left:'88%', r:2 },
        ].map((d, i) => (
          <div key={i} style={{
            position:   'absolute', top: d.top, left: d.left,
            width:      d.r*2,      height: d.r*2,
            borderRadius: '50%',
            background:   'white',
            opacity:      0.5,
            boxShadow:    `0 0 ${d.r*4}px ${d.r*2}px rgba(255,255,255,0.25)`,
          }}/>
        ))}

        {/* Birthday badge */}
        {isBirthday && (
          <div
            className="glass absolute"
            style={{ top: 20, right: 16, borderRadius: 99, padding: '4px 14px', fontSize: 11, color: 'white', fontWeight: 500 }}
          >
            🎂 お誕生日おめでとう
          </div>
        )}

        {/* Bottom text content */}
        <div style={{
          position:   'absolute',
          inset:      0,
          display:    'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding:    '0 20px 28px',
        }}>
          {/* Oshi name */}
          <h1 style={{
            fontSize:     38,
            fontWeight:   700,
            color:        'white',
            letterSpacing: '-0.025em',
            lineHeight:   1.1,
            textShadow:   '0 2px 20px rgba(0,0,0,0.6)',
          }}>
            {profile.name}
          </h1>
          {profile.group && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', marginTop: 4, letterSpacing: '0.04em' }}>
              {profile.group}
            </p>
          )}

          {/* Stats pills row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            {meetDays !== null && (
              <div className="glass-dark" style={{ borderRadius: 20, padding: '10px 18px', flex: 1, textAlign: 'center' }}>
                <p className="font-serif-num" style={{ fontSize: 30, fontWeight: 600, color: 'white', lineHeight: 1 }}>
                  {meetDays.toLocaleString()}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: '0.04em' }}>
                  日目
                </p>
              </div>
            )}
            {nextEvent && nextDays !== null && (
              <div className="glass-dark" style={{ borderRadius: 20, padding: '10px 18px', flex: 1, textAlign: 'center' }}>
                <p className="font-serif-num" style={{ fontSize: 30, fontWeight: 600, color: 'white', lineHeight: 1 }}>
                  {nextDays}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: '0.04em' }}>
                  日後
                </p>
              </div>
            )}
            {meetDays === null && !nextEvent && (
              <div className="glass-dark" style={{ borderRadius: 20, padding: '10px 18px', flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Link href="/profile" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  プロフィールを設定 →
                </Link>
              </div>
            )}
          </div>

          {/* Sub-label */}
          {meetDays !== null && nextEvent && (
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 8 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>出会ってから</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>{nextEvent.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CARDS ── */}
      <div className="px-4 space-y-3 pb-2">

        {/* Level / Avatar card */}
        <Link href="/achievements" className="block card card-hover anim-fadeInUp p-4 active:scale-[0.985]">
          <div className="flex items-center gap-4">
            <Avatar level={gameState.level} size="md" config={avatarConfig} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[22px] font-semibold font-serif-num" style={{ color: '#1C1917' }}>
                  Lv.{gameState.level}
                </span>
                <span className="text-xs font-medium" style={{ color: `rgb(var(--accent))` }}>
                  {tier.title}
                </span>
              </div>
              {/* XP bar */}
              <div className="progress-track h-1.5 my-2">
                <div
                  className="progress-fill transition-all duration-700"
                  style={{ width: `${xpProg.pct}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px]" style={{ color: '#A8A29E' }}>
                  あと {(xpProg.needed - xpProg.current).toLocaleString()} XP
                </p>
                <p className="text-[10px]" style={{ color: '#A8A29E' }}>
                  🏆 {earnedCount}/{ACHIEVEMENTS.length}
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Savings card */}
        <Link href="/savings" className="block card card-hover anim-fadeInUp stagger-1 p-5 active:scale-[0.985]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>
                推し活貯金
              </p>
              {savings.goal > 0 ? (
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-semibold font-serif-num" style={{ color: '#1C1917' }}>
                    {formatYen(savings.current)}
                  </span>
                  <span className="text-xs" style={{ color: '#A8A29E' }}>
                    / {formatYen(savings.goal)}
                  </span>
                </div>
              ) : (
                <p className="text-sm mt-1" style={{ color: '#A8A29E' }}>目標を設定しよう</p>
              )}
            </div>
            <span
              className="text-lg font-semibold font-serif-num"
              style={{ color: `rgb(var(--accent))` }}
            >
              {savingsPct > 0 ? `${savingsPct}%` : '✦'}
            </span>
          </div>
          {savings.goal > 0 && (
            <div className="progress-track h-1.5">
              <div
                className="progress-fill"
                style={{ width: `${savingsPct}%` }}
              />
            </div>
          )}
          {savings.goal > 0 && savings.current < savings.goal && (
            <p className="text-[11px] mt-2" style={{ color: '#A8A29E' }}>
              あと {formatYen(savings.goal - savings.current)} で夢が叶う ✨
            </p>
          )}
          {savingsPct >= 100 && (
            <p className="text-[11px] mt-2 font-medium" style={{ color: `rgb(var(--accent))` }}>
              目標達成おめでとう 🎉
            </p>
          )}
        </Link>

        {/* Monthly expense */}
        <Link href="/expenses" className="block card card-hover anim-fadeInUp stagger-2 p-5 active:scale-[0.985]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>
                今月の支出
              </p>
              <p className="text-[32px] font-semibold font-serif-num mt-1" style={{ color: '#1C1917', letterSpacing: '-0.03em' }}>
                {formatYen(monthlyTotal)}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
              style={{ background: `rgba(var(--accent),0.1)` }}
            >
              💸
            </div>
          </div>
        </Link>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 anim-fadeInUp stagger-3">
          <Link href="/wishlist" className="card card-hover p-5 text-center active:scale-[0.985]">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg mx-auto mb-2" style={{ background: `rgba(var(--accent),0.1)` }}>
              🛍️
            </div>
            <p className="text-sm font-medium" style={{ color: '#1C1917' }}>欲しいグッズ</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>ウィッシュリスト</p>
          </Link>
          <Link href="/logs" className="card card-hover p-5 text-center active:scale-[0.985]">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg mx-auto mb-2" style={{ background: `rgba(var(--accent),0.1)` }}>
              📸
            </div>
            <p className="text-sm font-medium" style={{ color: '#1C1917' }}>ライブレポート</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>参戦の思い出</p>
          </Link>
          <Link href="/timeline" className="card card-hover p-5 text-center active:scale-[0.985]">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg mx-auto mb-2" style={{ background: `rgba(var(--accent),0.1)` }}>
              📖
            </div>
            <p className="text-sm font-medium" style={{ color: '#1C1917' }}>推し年表</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>思い出の軌跡</p>
          </Link>
          <Link href="/achievements" className="card card-hover p-5 text-center active:scale-[0.985]">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg mx-auto mb-2" style={{ background: `rgba(var(--accent),0.1)` }}>
              🏆
            </div>
            <p className="text-sm font-medium" style={{ color: '#1C1917' }}>実績</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>{earnedCount}/{ACHIEVEMENTS.length} 獲得</p>
          </Link>
        </div>

        {/* Next event detail (if upcoming) */}
        {nextEvent && (
          <Link
            href="/events"
            className="block card card-hover anim-fadeInUp stagger-4 overflow-hidden active:scale-[0.985]"
          >
            <div
              className="h-1"
              style={{ background: `linear-gradient(90deg, rgb(var(--accent)), rgba(var(--accent),0.3))` }}
            />
            <div className="p-5">
              <p className="text-[11px] font-medium tracking-widest uppercase mb-2" style={{ color: '#A8A29E' }}>
                次のイベント
              </p>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-base" style={{ color: '#1C1917' }}>{nextEvent.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>
                    {formatDate(nextEvent.date)}{nextEvent.venue ? `　📍 ${nextEvent.venue}` : ''}
                  </p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-3xl font-semibold font-serif-num" style={{ color: `rgb(var(--accent))` }}>
                    {daysUntil(nextEvent.date)}
                  </p>
                  <p className="text-[11px]" style={{ color: '#A8A29E' }}>日後</p>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
