import type { Category, Prompt, PromptFilters, UsageHistory } from '@/types/prompthub';
import { isSameMonth, normalizeForSearch } from './utils';

export const EMPTY_FILTERS: PromptFilters = {
  keyword: '',
  category: '',
  aiTool: '',
  favoriteOnly: false,
  sort: 'updated',
};

export function hasActiveFilters(filters: PromptFilters): boolean {
  return (
    filters.keyword.trim() !== '' ||
    filters.category !== '' ||
    filters.aiTool !== '' ||
    filters.favoriteOnly
  );
}

function matchesKeyword(prompt: Prompt, keyword: string): boolean {
  if (!keyword) return true;
  const haystack = normalizeForSearch(
    [prompt.title, prompt.description, prompt.content, prompt.tags.join(' '), prompt.author].join(' ')
  );
  // スペース区切りのAND検索
  return normalizeForSearch(keyword)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

const SORTERS: Record<PromptFilters['sort'], (a: Prompt, b: Prompt) => number> = {
  updated: (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  usage: (a, b) => b.usageCount - a.usageCount,
  rating: (a, b) => b.rating - a.rating || b.usageCount - a.usageCount,
  title: (a, b) => a.title.localeCompare(b.title, 'ja'),
};

export function selectPrompts(prompts: Prompt[], filters: PromptFilters): Prompt[] {
  return prompts
    .filter((prompt) => {
      if (filters.favoriteOnly && !prompt.favorite) return false;
      if (filters.category && prompt.category !== filters.category) return false;
      if (filters.aiTool && !prompt.aiTools.includes(filters.aiTool)) return false;
      return matchesKeyword(prompt, filters.keyword);
    })
    .sort(SORTERS[filters.sort]);
}

export interface DashboardStats {
  total: number;
  favorites: number;
  usageThisMonth: number;
  totalUsage: number;
  teamShared: number;
  averageRating: number;
}

export function selectDashboardStats(prompts: Prompt[], history: UsageHistory[]): DashboardStats {
  const rated = prompts.filter((prompt) => prompt.rating > 0);
  const ratingSum = rated.reduce((sum, prompt) => sum + prompt.rating, 0);
  return {
    total: prompts.length,
    favorites: prompts.filter((prompt) => prompt.favorite).length,
    usageThisMonth: history.filter((entry) => isSameMonth(entry.usedAt)).length,
    totalUsage: prompts.reduce((sum, prompt) => sum + prompt.usageCount, 0),
    teamShared: prompts.filter((prompt) => prompt.visibility === 'team').length,
    averageRating: rated.length === 0 ? 0 : Math.round((ratingSum / rated.length) * 10) / 10,
  };
}

export function selectRecentPrompts(prompts: Prompt[], limit: number): Prompt[] {
  return [...prompts]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);
}

export function selectPopularPrompts(prompts: Prompt[], limit: number): Prompt[] {
  return [...prompts]
    .filter((prompt) => prompt.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

export interface CategoryUsage extends Category {
  /** 最も多いカテゴリーを 100 とした割合（棒グラフ用） */
  ratio: number;
}

export function selectCategoryDistribution(categories: Category[]): CategoryUsage[] {
  const max = categories.reduce((peak, category) => Math.max(peak, category.promptCount), 0);
  return [...categories]
    .sort((a, b) => b.promptCount - a.promptCount)
    .map((category) => ({
      ...category,
      ratio: max === 0 ? 0 : Math.round((category.promptCount / max) * 100),
    }));
}

export function selectRecentHistory(history: UsageHistory[], limit: number): UsageHistory[] {
  return [...history]
    .sort((a, b) => Date.parse(b.usedAt) - Date.parse(a.usedAt))
    .slice(0, limit);
}

export function findCategoryName(categories: Category[], id: string): string {
  return categories.find((category) => category.id === id)?.name ?? 'その他';
}
