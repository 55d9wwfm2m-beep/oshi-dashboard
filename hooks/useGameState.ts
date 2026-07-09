'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { GameState, DEFAULT_GAME_STATE } from '@/types';
import { getLevelFromXP, getLevelTier } from '@/lib/game';
import { showToast } from '@/components/ui/Toast';

export function useGameState() {
  const [state, setState, loaded] = useLocalStorage<GameState>('oshi-game', DEFAULT_GAME_STATE);

  const addXP = useCallback((amount: number, opts: { silent?: boolean } = {}) => {
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLv = getLevelFromXP(newXP);
      if (!opts.silent) {
        showToast(`+${amount} XP ✨`);
        if (newLv > prev.level) {
          const tier = getLevelTier(newLv);
          // XPトーストの後にレベルアップを重ねて表示
          setTimeout(() => {
            showToast(`${tier.char} レベルアップ！ Lv.${newLv}「${tier.title}」`, { accent: true, duration: 3200 });
          }, 450);
        }
      }
      return { ...prev, xp: newXP, level: newLv };
    });
  }, [setState]);

  const markLogin = useCallback((today: string) => {
    setState(prev => ({ ...prev, lastLoginDate: today }));
  }, [setState]);

  return { state, addXP, markLogin, loaded };
}
