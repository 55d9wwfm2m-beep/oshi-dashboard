import { LocalPromptHubRepository } from './local-repository';
import type { PromptHubRepository } from './repository';

let instance: PromptHubRepository | null = null;

/**
 * 永続化層のファクトリ。
 * Supabase へ移行する際は、この関数の戻り値を差し替えるだけでよい。
 */
export function getRepository(): PromptHubRepository {
  if (!instance) instance = new LocalPromptHubRepository();
  return instance;
}

export type { PromptHubRepository, PromptHubSnapshot } from './repository';
