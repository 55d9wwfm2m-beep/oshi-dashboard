/**
 * PromptHub のドメイン型。
 * 将来 Supabase へ移行する際、この型がそのままテーブル定義の下敷きになるよう
 * 日付は ISO 8601 文字列、参照は id 文字列で保持している。
 */

export const AI_TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'その他'] as const;
export type AiTool = (typeof AI_TOOLS)[number];

export const VISIBILITY_VALUES = ['private', 'team'] as const;
/** private: 個人用 / team: チーム共有 */
export type Visibility = (typeof VISIBILITY_VALUES)[number];

/** プロンプト本文の更新履歴（1件 = 1バージョン） */
export interface PromptRevision {
  version: number;
  updatedAt: string;
  author: string;
  /** 何を変えたかの短い説明 */
  note: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  example: string;
  /** Category.id を参照 */
  category: string;
  tags: string[];
  aiTools: AiTool[];
  author: string;
  visibility: Visibility;
  caution: string;
  favorite: boolean;
  usageCount: number;
  /** 0（未評価）〜 5 */
  rating: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  revisions: PromptRevision[];
}

export interface UsageHistory {
  id: string;
  promptId: string;
  /** プロンプトが削除されても履歴が読めるよう、タイトルは非正規化して保持する */
  promptTitle: string;
  usedAt: string;
  aiTool: AiTool;
  userName: string;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  /** 保存時は持たず、読み出し時に集計して埋める派生値 */
  promptCount: number;
}

/** フォームから受け取る入力値（サーバー側で決まる値は含まない） */
export type PromptDraft = Pick<
  Prompt,
  | 'title'
  | 'description'
  | 'content'
  | 'example'
  | 'category'
  | 'tags'
  | 'aiTools'
  | 'visibility'
  | 'caution'
>;

export const SORT_KEYS = ['updated', 'usage', 'rating', 'title'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export interface PromptFilters {
  keyword: string;
  /** 空文字はすべてのカテゴリー */
  category: string;
  /** 空文字はすべての対応AI */
  aiTool: '' | AiTool;
  favoriteOnly: boolean;
  sort: SortKey;
}

/** AI改善サービスの結果 */
export const IMPROVEMENT_KINDS = [
  'role',
  'condition',
  'format',
  'clarity',
  'reproducibility',
] as const;
export type ImprovementKind = (typeof IMPROVEMENT_KINDS)[number];

export interface ImprovementChange {
  kind: ImprovementKind;
  title: string;
  detail: string;
}

export interface ImproveResult {
  improved: string;
  changes: ImprovementChange[];
  /** demo: サンプル生成 / api: 実APIによる生成 */
  mode: 'demo' | 'api';
  provider: string;
  generatedAt: string;
}

export interface ImproveRequest {
  title: string;
  description: string;
  content: string;
  category: string;
  aiTools: AiTool[];
  caution: string;
}
