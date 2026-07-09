'use client';

import { useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OshiProfile, OshiEvent, AttendanceLog, Expense, Savings, GameState, DEFAULT_GAME_STATE } from '@/types';
import { ACHIEVEMENTS, checkAchievement } from '@/lib/game';
import { showToast } from '@/components/ui/Toast';

const DP: OshiProfile = { name:'', group:'', meetDate:'', birthday:'', photoUrl:'', themeColor:'196,164,160' };
const DS: Savings = { goal: 0, current: 0 };

/** 実績ID → 解放日(YYYY-MM-DD) */
export type EarnedMap = Record<string, string>;

/**
 * レイアウト常駐の実績ウォッチャー。
 * 全データを監視し、新しく条件を満たした実績を oshi-earned に永続化して
 * 「解放の瞬間」をトーストで祝う。
 * 初回（キー未作成）は既に満たしている実績を静かに一括付与（既存ユーザーの移行）。
 */
export default function AchievementWatcher() {
  const [profile]  = useLocalStorage<OshiProfile>('oshi-profile', DP);
  const [events]   = useLocalStorage<OshiEvent[]>('oshi-events', []);
  const [logs]     = useLocalStorage<AttendanceLog[]>('oshi-logs', []);
  const [expenses] = useLocalStorage<Expense[]>('oshi-expenses', []);
  const [savings]  = useLocalStorage<Savings>('oshi-savings', DS);
  const [gameState, , gLoaded] = useLocalStorage<GameState>('oshi-game', DEFAULT_GAME_STATE);
  const [earned, setEarned, eLoaded] = useLocalStorage<EarnedMap | null>('oshi-earned', null);
  const seeded = useRef(false);

  useEffect(() => {
    if (!gLoaded || !eLoaded) return;
    const checkData = { profile, events, logs, expenses, savings, gameState };
    const satisfied = ACHIEVEMENTS.filter(a => checkAchievement(a.id, checkData));
    const today = new Date().toISOString().slice(0, 10);

    // 初回：既に達成済みの実績を静かに登録（トーストなし＝移行）
    if (earned === null) {
      if (seeded.current) return;
      seeded.current = true;
      const seed: EarnedMap = {};
      satisfied.forEach(a => { seed[a.id] = today; });
      setEarned(seed);
      return;
    }

    const fresh = satisfied.filter(a => !(a.id in earned));
    if (fresh.length === 0) return;

    setEarned(prev => {
      const next: EarnedMap = { ...(prev ?? {}) };
      fresh.forEach(a => { next[a.id] = today; });
      return next;
    });
    fresh.forEach((a, i) => {
      setTimeout(() => {
        showToast(`🏆 実績解放「${a.name}」`, { accent: true, duration: 3000 });
      }, 900 + i * 1200);
    });
  }, [profile, events, logs, expenses, savings, gameState, earned, gLoaded, eLoaded, setEarned]);

  return null;
}
