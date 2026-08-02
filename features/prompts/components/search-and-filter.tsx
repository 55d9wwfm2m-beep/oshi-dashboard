'use client';

import { RotateCcw, Search, Star, X } from 'lucide-react';
import { useId } from 'react';
import { Button } from '@/components/prompthub/ui/button';
import { Select } from '@/components/prompthub/ui/field';
import { SORT_OPTIONS } from '@/lib/prompthub/constants';
import { hasActiveFilters } from '@/lib/prompthub/selectors';
import { cn } from '@/lib/prompthub/utils';
import { AI_TOOLS, type AiTool, type Category, type PromptFilters, type SortKey } from '@/types/prompthub';

interface SearchAndFilterProps {
  filters: PromptFilters;
  onChange: (next: PromptFilters) => void;
  onReset: () => void;
  categories: Category[];
  resultCount: number;
  totalCount: number;
  /** お気に入り画面のように、お気に入り絞り込みが常に有効な画面では非表示にする */
  showFavoriteToggle?: boolean;
}

export function SearchAndFilter({
  filters,
  onChange,
  onReset,
  categories,
  resultCount,
  totalCount,
  showFavoriteToggle = true,
}: SearchAndFilterProps) {
  const ids = {
    keyword: useId(),
    category: useId(),
    aiTool: useId(),
    sort: useId(),
  };
  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
          <label htmlFor={ids.keyword} className="sr-only">
            キーワードで検索
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ph-subtle"
          />
          <input
            id={ids.keyword}
            type="search"
            value={filters.keyword}
            onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
            placeholder="タイトル・本文・タグから検索"
            className="min-h-[44px] w-full rounded-md border border-ph-border bg-ph-surface pl-9 pr-9 text-[15px] text-ph-fg placeholder:text-ph-subtle focus:outline focus:outline-2 focus:outline-ph-accent"
          />
          {filters.keyword ? (
            <button
              type="button"
              onClick={() => onChange({ ...filters, keyword: '' })}
              aria-label="検索キーワードを消す"
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded text-ph-subtle transition-colors hover:bg-ph-surface-2 hover:text-ph-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <div>
            <label htmlFor={ids.category} className="sr-only">
              カテゴリーで絞り込む
            </label>
            <Select
              id={ids.category}
              value={filters.category}
              onChange={(event) => onChange({ ...filters, category: event.target.value })}
              className="sm:w-[200px]"
            >
              <option value="">すべてのカテゴリー</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}（{category.promptCount}）
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor={ids.aiTool} className="sr-only">
              対応AIで絞り込む
            </label>
            <Select
              id={ids.aiTool}
              value={filters.aiTool}
              onChange={(event) =>
                onChange({ ...filters, aiTool: event.target.value as '' | AiTool })
              }
              className="sm:w-[172px]"
            >
              <option value="">すべての対応AI</option>
              {AI_TOOLS.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </Select>
          </div>

          <div className={cn(showFavoriteToggle ? '' : 'col-span-2')}>
            <label htmlFor={ids.sort} className="sr-only">
              並び替え
            </label>
            <Select
              id={ids.sort}
              value={filters.sort}
              onChange={(event) => onChange({ ...filters, sort: event.target.value as SortKey })}
              className="sm:w-[150px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {showFavoriteToggle ? (
            <Button
              variant={filters.favoriteOnly ? 'accent' : 'secondary'}
              aria-pressed={filters.favoriteOnly}
              onClick={() => onChange({ ...filters, favoriteOnly: !filters.favoriteOnly })}
              className="min-h-[44px]"
            >
              <Star
                aria-hidden="true"
                className={cn('h-4 w-4', filters.favoriteOnly ? 'fill-current' : '')}
              />
              お気に入り
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ph-muted">
        <p aria-live="polite">
          <span className="font-medium tabular-nums text-ph-fg">{resultCount}</span> 件
          <span className="text-ph-subtle">（全 {totalCount} 件中）</span>
        </p>
        {active ? (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            絞り込みをリセット
          </Button>
        ) : null}
      </div>
    </div>
  );
}
