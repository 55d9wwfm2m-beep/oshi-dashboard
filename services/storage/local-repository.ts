import { DEFAULT_CATEGORIES } from '@/data/prompthub/categories';
import { createSampleHistory } from '@/data/prompthub/sample-history';
import { createSamplePrompts } from '@/data/prompthub/sample-prompts';
import { STORAGE_KEYS } from '@/lib/prompthub/constants';
import { isStorageAvailable, readJson, removeKey, writeJson } from '@/lib/prompthub/safe-storage';
import type { Category, Prompt, UsageHistory } from '@/types/prompthub';
import type { PromptHubRepository, PromptHubSnapshot } from './repository';

function buildSeed(): PromptHubSnapshot {
  const prompts = createSamplePrompts();
  return {
    prompts,
    history: createSampleHistory(prompts),
    categories: DEFAULT_CATEGORIES,
  };
}

/**
 * localStorage 実装。
 * 読み込み時に必ず形を検証し、壊れたデータが入っていてもアプリが落ちないようにする。
 */
export class LocalPromptHubRepository implements PromptHubRepository {
  isPersistent(): boolean {
    return isStorageAvailable();
  }

  async load(): Promise<PromptHubSnapshot> {
    const seeded = readJson<boolean>(STORAGE_KEYS.seeded, false);
    if (!seeded) {
      const seed = buildSeed();
      writeJson(STORAGE_KEYS.prompts, seed.prompts);
      writeJson(STORAGE_KEYS.history, seed.history);
      writeJson(STORAGE_KEYS.categories, seed.categories);
      writeJson(STORAGE_KEYS.seeded, true);
      return seed;
    }

    const fallback = buildSeed();
    return {
      prompts: asArray(readJson<Prompt[]>(STORAGE_KEYS.prompts, []), fallback.prompts),
      history: asArray(readJson<UsageHistory[]>(STORAGE_KEYS.history, []), fallback.history),
      categories: asArray(
        readJson<Category[]>(STORAGE_KEYS.categories, []),
        fallback.categories
      ),
    };
  }

  async savePrompts(prompts: Prompt[]): Promise<boolean> {
    return writeJson(STORAGE_KEYS.prompts, prompts);
  }

  async saveHistory(history: UsageHistory[]): Promise<boolean> {
    return writeJson(STORAGE_KEYS.history, history);
  }

  async saveCategories(categories: Category[]): Promise<boolean> {
    return writeJson(STORAGE_KEYS.categories, categories);
  }

  async reset(): Promise<PromptHubSnapshot> {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.theme) removeKey(key);
    });
    return this.load();
  }
}

/**
 * 配列でなければフォールバックを返す。
 * 「空配列」はユーザーが全削除した正当な状態なので、そのまま尊重する。
 */
function asArray<T>(value: T[], fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback;
}
