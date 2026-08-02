'use client';

import { Clock, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { EmptyState } from '@/components/prompthub/ui/empty-state';
import { Select } from '@/components/prompthub/ui/field';
import { SkeletonRows } from '@/components/prompthub/ui/skeleton';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { LIMITS } from '@/lib/prompthub/constants';
import { isSameMonth, normalizeForSearch } from '@/lib/prompthub/utils';
import { AI_TOOLS, type AiTool } from '@/types/prompthub';
import { UsageHistoryList } from './usage-history-list';

export function HistoryView() {
  const { status, history, prompts } = usePromptHub();
  const [keyword, setKeyword] = useState('');
  const [aiTool, setAiTool] = useState<'' | AiTool>('');
  const [visibleCount, setVisibleCount] = useState<number>(LIMITS.historyPageSize);

  const existingIds = useMemo(() => new Set(prompts.map((prompt) => prompt.id)), [prompts]);

  const filtered = useMemo(() => {
    const needle = normalizeForSearch(keyword);
    return [...history]
      .filter((entry) => {
        if (aiTool && entry.aiTool !== aiTool) return false;
        if (!needle) return true;
        return normalizeForSearch(`${entry.promptTitle} ${entry.userName}`).includes(needle);
      })
      .sort((a, b) => Date.parse(b.usedAt) - Date.parse(a.usedAt));
  }, [history, keyword, aiTool]);

  const thisMonth = useMemo(
    () => history.filter((entry) => isSameMonth(entry.usedAt)).length,
    [history]
  );

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">利用履歴</h1>
        <p className="text-[15px] text-ph-muted">
          今月 {thisMonth} 回・累計 {history.length} 回の利用が記録されています。どのプロンプトが現場で効いているかを確認できます。
        </p>
      </div>

      {status === 'loading' ? (
        <SkeletonRows rows={5} />
      ) : history.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="まだ利用履歴がありません"
          description="プロンプトの詳細画面で「使用したことを記録」を押すと、ここに履歴が残ります。使われている型が可視化され、改善の材料になります。"
          action={
            <Button asChild variant="primary">
              <Link href={`${PROMPTHUB_BASE}/prompts`}>プロンプト一覧を見る</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="history-search" className="sr-only">
                プロンプト名・利用者で検索
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ph-subtle"
              />
              <input
                id="history-search"
                type="search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setVisibleCount(LIMITS.historyPageSize);
                }}
                placeholder="プロンプト名・利用者で検索"
                className="min-h-[44px] w-full rounded-md border border-ph-border bg-ph-surface pl-9 pr-3 text-[15px] text-ph-fg placeholder:text-ph-subtle focus:outline focus:outline-2 focus:outline-ph-accent"
              />
            </div>
            <div>
              <label htmlFor="history-ai" className="sr-only">
                対応AIで絞り込む
              </label>
              <Select
                id="history-ai"
                value={aiTool}
                onChange={(event) => setAiTool(event.target.value as '' | AiTool)}
                className="sm:w-[180px]"
              >
                <option value="">すべての対応AI</option>
                {AI_TOOLS.map((tool) => (
                  <option key={tool} value={tool}>
                    {tool}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <p className="text-sm text-ph-muted" aria-live="polite">
            <span className="font-medium tabular-nums text-ph-fg">{filtered.length}</span> 件
            <span className="text-ph-subtle">（全 {history.length} 件中）</span>
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="条件に一致する履歴がありません"
              description="キーワードを短くするか、対応AIの絞り込みを外してください。"
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setKeyword('');
                    setAiTool('');
                  }}
                >
                  条件をリセット
                </Button>
              }
            />
          ) : (
            <>
              <UsageHistoryList entries={visible} existingPromptIds={existingIds} />
              {visible.length < filtered.length ? (
                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setVisibleCount((prev) => prev + LIMITS.historyPageSize)}
                  >
                    さらに{Math.min(LIMITS.historyPageSize, filtered.length - visible.length)}件を表示
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
