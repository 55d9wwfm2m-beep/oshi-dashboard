'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { GameState, DEFAULT_GAME_STATE } from '@/types';
import { getLevelFromXP } from '@/lib/game';

export function useGameState() {
  const [state, setState, loaded] = useLocalStorage<GameState>('oshi-game', DEFAULT_GAME_STATE);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP  = prev.xp + amount;
      const newLv  = getLevelFromXP(newXP);
      return { ...prev, xp: newXP, level: newLv };
    });
  }, [setState]);

  const markLogin = useCallback((today: string) => {
    setState(prev => ({ ...prev, lastLoginDate: today }));
  }, [setState]);

  return { state, addXP, markLogin, loaded };
}
