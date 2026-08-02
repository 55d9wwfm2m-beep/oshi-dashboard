'use client';

import { Plus, SearchX, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { EmptyState } from '@/components/prompthub/ui/empty-state';
import { SkeletonRows } from '@/components/prompthub/ui/skeleton';
import { useToast } from '@/components/prompthub/ui/toast';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { EMPTY_FILTERS, hasActiveFilters, selectPrompts } from '@/lib/prompthub/selectors';
import { SORT_KEYS, type PromptFilters, type SortKey } from '@/types/prompthub';
import { PromptList } from './prompt-list';
import { SearchAndFilter } from './search-and-filter';

function isSortKey(value: string | null): value is SortKey {
  return value !== null && (SORT_KEYS as readonly string[]).includes(value);
}

export function PromptsView() {
  const searchParams = useSearchParams();
  const { status, prompts, categories, toggleFavorite } = usePromptHub();
  const { toast } = useToast();

  // URLの条件（ヘッダー検索・ダッシュボードからの遷移）を初期値として取り込む
  const [filters, setFilters] = useState<PromptFilters>(() => {
    const sort = searchParams.get('sort');
    return {
      ...EMPTY_FILTERS,
      keyword: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? '',
      sort: isSortKey(sort) ? sort : EMPTY_FILTERS.sort,
    };
  });

  const visible = useMemo(() => selectPrompts(prompts, filters), [prompts, filters]);

  const handleToggleFavorite = (id: string) => {
    const next = toggleFavorite(id);
    toast({
      title: next ? 'お気に入りに追加しました' : 'お気に入りから外しました',
      variant: next ? 'success' : 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">プロンプト一覧</h1>
          <p className="text-[15px] text-ph-muted">
            チームに蓄積されたプロンプトを検索・絞り込みできます。
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href={`${PROMPTHUB_BASE}/prompts/new`}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            新しいプロンプト
          </Link>
        </Button>
      </div>

      <SearchAndFilter
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        categories={categories}
        resultCount={visible.length}
        totalCount={prompts.length}
      />

      {status === 'loading' ? (
        <SkeletonRows rows={5} />
      ) : prompts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="まだプロンプトが登録されていません"
          description="普段AIに送っている指示文を登録すると、次からは検索して再利用できます。まずは1件登録してみましょう。"
          action={
            <Button asChild variant="primary">
              <Link href={`${PROMPTHUB_BASE}/prompts/new`}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                プロンプトを登録
              </Link>
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="条件に一致するプロンプトがありません"
          description="キーワードを短くするか、カテゴリー・対応AIの絞り込みを外すと見つかることがあります。"
          action={
            <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
              絞り込みをリセット
            </Button>
          }
          secondaryAction={
            hasActiveFilters(filters) ? (
              <Button asChild variant="primary">
                <Link href={`${PROMPTHUB_BASE}/prompts/new`}>この内容で新しく登録する</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <PromptList
          prompts={visible}
          categories={categories}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
