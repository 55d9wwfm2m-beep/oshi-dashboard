'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import Link from 'next/link';
import { OshiProfile, OshiEvent, AttendanceLog, Expense, Savings, WishlistItem } from '@/types';
import { ACHIEVEMENTS, RARITY_STYLE, checkAchievement, getLevelTier } from '@/lib/game';
import Avatar from '@/components/Avatar';
import { useAvatarEquip } from '@/hooks/useAvatarEquip';
import { unlockProgress, AvatarStats } from '@/components/avatar/catalog';
import type { EarnedMap } from '@/components/AchievementWatcher';
import { daysSince, formatDateShort } from '@/lib/utils';

const DP: OshiProfile = { name:'', group:'', meetDate:'', birthday:'', photoUrl:'', themeColor:'196,164,160' };
const DS: Savings      = { goal: 0, current: 0 };

export default function AchievementsPage() {
  const [profile]  = useLocalStorage<OshiProfile>('oshi-profile',  DP);
  const [events]   = useLocalStorage<OshiEvent[]>('oshi-events',   []);
  const [logs]     = useLocalStorage<AttendanceLog[]>('oshi-logs', []);
  const [expenses] = useLocalStorage<Expense[]>('oshi-expenses',   []);
  const [savings]      = useLocalStorage<Savings>('oshi-savings',       DS);
  const [wishlist] = useLocalStorage<WishlistItem[]>('oshi-wishlist', []);
  const [earnedMap] = useLocalStorage<EarnedMap | null>('oshi-earned', null);
  const { equip: avatarConfig } = useAvatarEquip();
  const { state: gameState, loaded } = useGameState();

  if (!loaded) return null;

  const checkData = { profile, events, logs, expenses, savings, gameState };
  const isEarned = (id: string) => !!earnedMap?.[id] || checkAchievement(id, checkData);
  const earned = ACHIEVEMENTS.filter(a => isEarned(a.id));
  const locked = ACHIEVEMENTS.filter(a => !isEarned(a.id));
  const tier   = getLevelTier(gameState.level);
  const stats: AvatarStats = {
    level:    gameState.level,
    events:   events.length,
    logs:     logs.length,
    goods:    wishlist.filter(w => w.purchased).length,
    expenses: expenses.length,
    days:     profile.meetDate ? daysSince(profile.meetDate) : 0,
  };
  const prog = unlockProgress(stats);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-8 pb-5 anim-fadeIn">
        <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>RPG</p>
        <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>実績 & アバター</h1>
      </div>

      <div className="px-4 space-y-4 pb-4">
        {/* Avatar card */}
        <div className="card p-5 anim-scaleIn">
          <div className="flex items-center gap-4">
            <Avatar level={gameState.level} size="lg" config={avatarConfig} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium tracking-wider uppercase mb-0.5" style={{ color: '#A8A29E' }}>
                {tier.title}
              </p>
              <h2 className="text-2xl font-semibold font-serif-num" style={{ color: '#1C1917' }}>
                Lv.{gameState.level}
              </h2>
              <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>
                累計 {gameState.xp.toLocaleString()} XP
              </p>
              <p className="text-[11px] mt-2" style={{ color: '#A8A29E' }}>
                きせかえ {prog.unlocked}/{prog.total} 解放中
              </p>
            </div>
          </div>
        </div>

        {/* きせかえ導線 */}
        <Link href="/avatar" className="block card card-hover p-5 anim-fadeInUp stagger-1 active:scale-[0.985]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: '#78716C' }}>きせかえアイテム</p>
            <span className="text-xs font-medium" style={{ color: avatarConfig.oshiColor }}>きせかえへ →</span>
          </div>
          <div className="progress-track h-1.5">
            <div className="progress-fill" style={{ width: `${Math.round((prog.unlocked / prog.total) * 100)}%` }} />
          </div>
          <p className="text-[11px] mt-2" style={{ color: '#A8A29E' }}>
            {prog.unlocked}/{prog.total} 解放 — イベントやログを記録すると増えていきます
          </p>
        </Link>

        {/* Achievement summary */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between anim-fadeInUp stagger-2"
          style={{ background: `rgba(var(--accent),0.08)`, border: `1px solid rgba(var(--accent),0.15)` }}
        >
          <div>
            <p className="text-xs font-medium" style={{ color: `rgb(var(--accent))` }}>実績解放数</p>
            <p className="text-3xl font-semibold font-serif-num mt-0.5" style={{ color: '#1C1917' }}>
              {earned.length}
              <span className="text-base font-normal ml-1" style={{ color: '#A8A29E' }}>/ {ACHIEVEMENTS.length}</span>
            </p>
          </div>
          <div className="text-4xl">🏆</div>
        </div>

        {/* Earned achievements */}
        {earned.length > 0 && (
          <div className="space-y-2 anim-fadeInUp stagger-3">
            <p className="text-xs font-medium tracking-wider uppercase px-1" style={{ color: '#A8A29E' }}>
              獲得済み — {earned.length}件
            </p>
            {earned.map((ach, i) => {
              const rs = RARITY_STYLE[ach.rarity];
              return (
                <div
                  key={ach.id}
                  className="card p-4 flex items-center gap-3 anim-fadeInUp"
                  style={{ animationDelay: `${i * 40}ms`, borderLeft: `3px solid ${rs.border}` }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: rs.bg, border: `1px solid ${rs.border}` }}
                  >
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>{ach.name}</p>
                      <span
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: rs.bg, color: rs.color }}
                      >
                        {rs.label}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>
                      {ach.desc}
                      {earnedMap?.[ach.id] ? `　·　${formatDateShort(earnedMap[ach.id])} 解放` : ''}
                    </p>
                  </div>
                  <span className="text-lg shrink-0">✓</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Locked achievements */}
        {locked.length > 0 && (
          <div className="space-y-2 anim-fadeInUp stagger-4">
            <p className="text-xs font-medium tracking-wider uppercase px-1" style={{ color: '#A8A29E' }}>
              未獲得 — {locked.length}件
            </p>
            {locked.map((ach, i) => (
              <div
                key={ach.id}
                className="card p-4 flex items-center gap-3 opacity-50 anim-fadeInUp"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: '#F0EBE6', border: '1px solid #E8E2DC' }}
                >
                  🔒
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#78716C' }}>{ach.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>{ach.desc}</p>
                </div>
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: '#F0EBE6', color: '#A8A29E' }}
                >
                  {RARITY_STYLE[ach.rarity].label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
