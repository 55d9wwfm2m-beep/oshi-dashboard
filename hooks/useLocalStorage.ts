'use client';

import { useState, useEffect, useCallback } from 'react';
import { showToast } from '@/components/ui/Toast';

/**
 * localStorage 同期フック。
 * v2: 同一タブ内の別コンポーネントとも CustomEvent で同期する
 * （レイアウト常駐の実績ウォッチャー等が、各ページの保存を即時検知するため）。
 * 既存の API・保存形式は完全互換。
 */
const SYNC_EVENT = 'oshi-ls-sync';

/** 保存失敗（容量不足等）の警告は1セッション1回だけ出す */
let warnedWriteFailure = false;

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) setStoredValue(JSON.parse(item));
    } catch {
      // ignore
    }
    setIsLoaded(true);

    // 同一タブ内で他コンポーネントが同じキーを更新した時に追従する
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string; value: unknown }>).detail;
      if (detail?.key === key) setStoredValue(detail.value as T);
    };
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
          window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key, value: next } }));
        } catch {
          // 容量不足などで保存できなかった場合、無言でデータが消えるのを防ぐため警告する
          if (!warnedWriteFailure) {
            warnedWriteFailure = true;
            showToast('⚠️ 保存に失敗しました。写真の枚数を減らすか、バックアップを取ってください');
          }
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue, isLoaded] as const;
}
