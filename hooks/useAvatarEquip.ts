'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AvatarEquip, DEFAULT_EQUIP } from '@/components/avatar/catalog';
import type { AvatarConfig } from '@/types';

const KEY = 'oshi-avatar-v2';

/* 旧DiceBear設定 → 新ちびアバター装備への移行 */
const HAIR_STYLE_MAP: Record<string, string> = {
  long01: 'long', long03: 'long', long13: 'bob', long07: 'wave',
  short01: 'short', short04: 'short',
};
const HAIR_COLOR_MAP: Record<string, string> = {
  '#1A1A2E': 'black', '#6D4C2B': 'brown', '#C4834A': 'brown', '#E8C050': 'blonde',
  '#D4608A': 'pink', '#7B3FA0': 'lavender', '#4B9CD3': 'sky', '#E8E0D8': 'silver',
};
const EYE_STYLE_MAP: Record<string, string> = {
  variant01: 'round', variant12: 'tareme', variant22: 'sharp',
};
const SKIN_MAP: Record<string, string> = {
  '#FFDBB4': 'porcelain', '#F9C9B6': 'light', '#F4A072': 'medium',
  '#D4956A': 'tan', '#A0714F': 'deep',
};
const EYE_COLOR_BY_OSHI: Record<string, string> = {
  '#E91E8C': 'pink', '#E53935': 'brown', '#1E88E5': 'blue', '#8E24AA': 'purple',
  '#F9A825': 'amber', '#43A047': 'green', '#29B6F6': 'blue', '#F4511E': 'amber',
};

function migrate(old: Partial<AvatarConfig>): AvatarEquip {
  const isMan = old.sex === 'man';
  return {
    ...DEFAULT_EQUIP,
    skin:      SKIN_MAP[old.faceColor ?? ''] ?? 'light',
    hairStyle: isMan ? 'centerPart' : (HAIR_STYLE_MAP[old.hairStyle ?? ''] ?? 'long'),
    hairColor: HAIR_COLOR_MAP[old.hairColor ?? ''] ?? 'brown',
    eyeStyle:  EYE_STYLE_MAP[old.eyeStyle ?? ''] ?? 'round',
    eyeColor:  EYE_COLOR_BY_OSHI[old.oshiColor ?? ''] ?? 'brown',
    outfit:    isMan ? 'gakuran' : 'onepiece',
    headwear:  'none',
    oshiColor: old.oshiColor ?? DEFAULT_EQUIP.oshiColor,
  };
}

/**
 * アバター装備の読み書きフック。
 * 初回は旧 'oshi-avatar-config'（DiceBear設定）から自動移行する。
 * 旧キーは消さずに残す（安全のため）。
 */
export function useAvatarEquip() {
  const [stored, setStored, loaded] = useLocalStorage<AvatarEquip | null>(KEY, null);
  const migrated = useRef(false);

  useEffect(() => {
    if (!loaded || stored !== null || migrated.current) return;
    migrated.current = true;
    let next = DEFAULT_EQUIP;
    try {
      const raw = window.localStorage.getItem('oshi-avatar-config');
      if (raw) next = migrate(JSON.parse(raw));
    } catch { /* ignore */ }
    setStored(next);
  }, [loaded, stored, setStored]);

  const equip = stored ?? DEFAULT_EQUIP;
  const setEquip = useCallback(
    (updater: Partial<AvatarEquip> | ((prev: AvatarEquip) => AvatarEquip)) => {
      setStored(prev => {
        const base = prev ?? DEFAULT_EQUIP;
        return typeof updater === 'function' ? updater(base) : { ...base, ...updater };
      });
    },
    [setStored],
  );

  return { equip, setEquip, loaded };
}
