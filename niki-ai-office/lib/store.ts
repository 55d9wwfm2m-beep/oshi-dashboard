import type { OfficeState } from './types';
import { createSeedState } from './seed';

export const STORAGE_KEY = 'niki-office:v1';
export const STORE_VERSION = 1;

export type LoadResult =
  | { ok: true; state: OfficeState; fresh: boolean }
  | { ok: false; error: string };

// localStorageから安全に読み込む。
// - 未保存なら seed を作って返す（fresh=true）
// - 壊れたJSONでも既存キーは消さない（誤消去の防止）
export function loadState(): LoadResult {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'no-window' };
  }
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, error: 'localStorageにアクセスできませんでした（プライベートモードの可能性）。' };
  }

  if (raw === null) {
    return { ok: true, state: createSeedState(), fresh: true };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OfficeState>;
    const state = migrate(parsed);
    return { ok: true, state, fresh: false };
  } catch {
    // パースできない場合でも既存データは削除しない。読み取り専用で失敗を返す。
    return {
      ok: false,
      error: '保存データを読み込めませんでした。データは残したままにしています。',
    };
  }
}

// 保存。失敗しても例外を投げず boolean を返す（容量オーバー等を上位でハンドリング）
export function saveState(state: OfficeState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// 将来のスキーマ変更に備えた最小マイグレーション。
// 欠けたフィールドはseedの器で補完し、既存データは尊重する。
function migrate(parsed: Partial<OfficeState>): OfficeState {
  const seed = createSeedState();
  return {
    version: STORE_VERSION,
    seeded: parsed.seeded ?? true,
    projects: parsed.projects ?? seed.projects,
    employees: parsed.employees ?? seed.employees,
    tasks: parsed.tasks ?? seed.tasks,
    meetings: parsed.meetings ?? seed.meetings,
    forceAfterHours: parsed.forceAfterHours ?? false,
  };
}
