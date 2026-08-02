'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { EmptyState } from '@/components/prompthub/ui/empty-state';
import { SkeletonRows } from '@/components/prompthub/ui/skeleton';
import { useToast } from '@/components/prompthub/ui/toast';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { EMPTY_FILTERS, selectPrompts } from '@/lib/prompthub/selectors';
import type { PromptFilters } from '@/types/prompthub';
import { PromptList } from './prompt-list';
import { SearchAndFilter } from './search-and-filter';

const FAVORITE_FILTERS: PromptFilters = { ...EMPTY_FILTERS, favoriteOnly: true };

export function FavoritesView() {
  const { status, prompts, categories, toggleFavorite } = usePromptHub();
  const { toast } = useToast();
  const [filters, setFilters] = useState<PromptFilters>(FAVORITE_FILTERS);

  const favorites = useMemo(() => prompts.filter((prompt) => prompt.favorite), [prompts]);
  const visible = useMemo(() => selectPrompts(prompts, filters), [prompts, filters]);

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    toast({ title: 'お気に入りから外しました', variant: 'info' });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">お気に入り</h1>
        <p className="text-[15px] text-ph-muted">
          毎日使うプロンプトをここにまとめておくと、探す時間がなくなります。
        </p>
      </div>

      {status === 'loading' ? (
        <SkeletonRows rows={3} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Star}
          title="お気に入りはまだありません"
          description="プロンプト一覧や詳細画面の星アイコンを押すと、ここに追加されます。よく使うものから登録してみましょう。"
          action={
            <Button asChild variant="primary">
              <Link href={`${PROMPTHUB_BASE}/prompts`}>プロンプト一覧を見る</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SearchAndFilter
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(FAVORITE_FILTERS)}
            categories={categories}
            resultCount={visible.length}
            totalCount={favorites.length}
            showFavoriteToggle={false}
          />
          {visible.length === 0 ? (
            <EmptyState
              icon={Star}
              title="条件に一致するお気に入りがありません"
              description="絞り込み条件を外すと、お気に入り全体が表示されます。"
              action={
                <Button variant="secondary" onClick={() => setFilters(FAVORITE_FILTERS)}>
                  絞り込みをリセット
                </Button>
              }
            />
          ) : (
            <PromptList
              prompts={visible}
              categories={categories}
              onToggleFavorite={handleToggleFavorite}
              label="お気に入りのプロンプト"
            />
          )}
        </>
      )}
    </div>
  );
}
