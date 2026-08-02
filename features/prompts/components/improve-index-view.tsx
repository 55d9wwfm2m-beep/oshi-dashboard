'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { EmptyState } from '@/components/prompthub/ui/empty-state';
import { SkeletonRows } from '@/components/prompthub/ui/skeleton';
import { Panel } from '@/components/prompthub/ui/surface';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { IMPROVEMENT_LABELS } from '@/lib/prompthub/constants';
import { findCategoryName } from '@/lib/prompthub/selectors';
import { normalizeForSearch, truncate } from '@/lib/prompthub/utils';
import { CategoryBadge } from './category-badge';

const PREVIEW_LENGTH = 90;

export function ImproveIndexView() {
  const { status, prompts, categories } = usePromptHub();
  const [keyword, setKeyword] = useState('');

  const visible = useMemo(() => {
    const needle = normalizeForSearch(keyword);
    return prompts.filter((prompt) =>
      needle ? normalizeForSearch(`${prompt.title} ${prompt.description}`).includes(needle) : true
    );
  }, [prompts, keyword]);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">AIでプロンプトを改善</h1>
        <p className="max-w-3xl text-[15px] leading-relaxed text-ph-muted">
          登録済みのプロンプトを、AIが実務で使える形に整えます。改善前と改善後を左右で見比べ、納得できたときだけ保存できます。
        </p>
      </div>

      <Panel className="p-5">
        <h2 className="text-sm font-medium text-ph-fg">改善で見ているポイント</h2>
        <ul className="mt-3 grid gap-2 text-sm text-ph-muted sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(IMPROVEMENT_LABELS).map((label) => (
            <li key={label} className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-ph-accent" />
              {label}
            </li>
          ))}
        </ul>
      </Panel>

      {status === 'loading' ? (
        <SkeletonRows rows={4} />
      ) : prompts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="改善できるプロンプトがありません"
          description="まずはプロンプトを登録してください。登録済みのプロンプトを選ぶと、AIによる改善案を確認できます。"
          action={
            <Button asChild variant="primary">
              <Link href={`${PROMPTHUB_BASE}/prompts/new`}>プロンプトを登録</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div>
            <label htmlFor="improve-search" className="sr-only">
              改善するプロンプトを検索
            </label>
            <input
              id="improve-search"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="改善したいプロンプトを検索"
              className="min-h-[44px] w-full rounded-md border border-ph-border bg-ph-surface px-3 text-[15px] text-ph-fg placeholder:text-ph-subtle focus:outline focus:outline-2 focus:outline-ph-accent sm:max-w-md"
            />
          </div>

          <ul className="overflow-hidden rounded-lg border border-ph-border divide-y divide-ph-border">
            {visible.map((prompt) => (
              <li
                key={prompt.id}
                className="relative flex flex-wrap items-center gap-3 bg-ph-surface px-4 py-4 transition-colors hover:bg-ph-surface-2/60"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-medium text-ph-fg">{prompt.title}</h3>
                  <p className="ph-mono mt-1.5 line-clamp-2 text-xs text-ph-subtle">
                    {truncate(prompt.content.replace(/\s+/g, ' '), PREVIEW_LENGTH)}
                  </p>
                  <div className="mt-2">
                    <CategoryBadge name={findCategoryName(categories, prompt.category)} />
                  </div>
                </div>
                <Button asChild variant="secondary" className="min-h-[44px]">
                  <Link href={`${PROMPTHUB_BASE}/prompts/${prompt.id}/improve`}>
                    改善する
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
          {visible.length === 0 ? (
            <p className="text-sm text-ph-muted">条件に一致するプロンプトがありません。</p>
          ) : null}
        </>
      )}
    </div>
  );
}
