import type { Category, Prompt, UsageHistory } from '@/types/prompthub';

export interface PromptHubSnapshot {
  prompts: Prompt[];
  history: UsageHistory[];
  categories: Category[];
}

/**
 * 永続化層のインターフェース。
 * MVPでは localStorage 実装を使うが、すべて非同期シグネチャにしてあるため、
 * Supabase 実装（SupabaseRepository）へ差し替えても呼び出し側の変更は不要。
 */
export interface PromptHubRepository {
  /** 初回はサンプルデータを投入したうえで返す */
  load(): Promise<PromptHubSnapshot>;
  savePrompts(prompts: Prompt[]): Promise<boolean>;
  saveHistory(history: UsageHistory[]): Promise<boolean>;
  saveCategories(categories: Category[]): Promise<boolean>;
  /** 保存先が実際に永続化できる状態か（localStorage 無効環境の検知に使う） */
  isPersistent(): boolean;
  /** 保存データを消し、サンプルデータの状態へ戻す */
  reset(): Promise<PromptHubSnapshot>;
}
