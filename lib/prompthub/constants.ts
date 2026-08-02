import type { ImprovementKind, SortKey } from '@/types/prompthub';

/** localStorage のキー。将来 Supabase へ移す際はここだけを見ればよい。 */
export const STORAGE_KEYS = {
  prompts: 'prompthub:prompts',
  history: 'prompthub:history',
  categories: 'prompthub:categories',
  theme: 'prompthub:theme',
  seeded: 'prompthub:seeded',
} as const;

/** AI改善の結果を登録画面へ引き継ぐための sessionStorage キー */
export const IMPROVED_DRAFT_KEY = 'prompthub:improved-draft';

/** MVPでは認証を持たないため、単一の擬似ユーザーで動作する */
export const CURRENT_USER = {
  name: 'Niki',
  role: 'カスタマーサポート / AI推進担当',
  initials: 'NK',
} as const;

export const APP_NAME = 'PromptHub';
export const APP_TAGLINE = 'AI活用ノウハウを、チームの資産に。';

/** 一覧に何も出ないと寂しいので、履歴の表示件数などはここで一元管理する */
export const LIMITS = {
  dashboardRecent: 5,
  dashboardPopular: 5,
  dashboardHistory: 6,
  historyPageSize: 30,
  maxTags: 8,
  titleMax: 60,
  descriptionMax: 120,
  cautionMax: 200,
} as const;

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'updated', label: '新しい順' },
  { value: 'usage', label: '利用回数順' },
  { value: 'rating', label: '評価順' },
  { value: 'title', label: 'タイトル順' },
];

export const VISIBILITY_LABELS = {
  private: '個人用',
  team: 'チーム共有',
} as const;

export const IMPROVEMENT_LABELS: Record<ImprovementKind, string> = {
  role: '役割が明確になった',
  condition: '条件が整理された',
  format: '出力形式が追加された',
  clarity: '曖昧な表現が修正された',
  reproducibility: '再現性が上がった',
};
