/**
 * localStorage の薄いラッパー。
 * プライベートブラウジングや容量超過で例外が飛んでも、アプリが落ちないようにする。
 */

let unavailableNotified = false;

function getStore(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const probeKey = '__prompthub_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isStorageAvailable(): boolean {
  return getStore() !== null;
}

export function readJson<T>(key: string, fallback: T): T {
  const store = getStore();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 保存できたら true。容量超過などで失敗したら false を返す（例外は投げない）。 */
export function writeJson(key: string, value: unknown): boolean {
  const store = getStore();
  if (!store) {
    unavailableNotified = true;
    return false;
  }
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  getStore()?.removeItem(key);
}

export function hasNotifiedUnavailable(): boolean {
  return unavailableNotified;
}
