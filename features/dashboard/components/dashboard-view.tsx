'use client';

import { BarChart3, Clock, Plus, Sparkles, Star, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { StatCard } from '@/components/prompthub/stat-card';
import { Button } from '@/components/prompthub/ui/button';
import { EmptyState } from '@/components/prompthub/ui/empty-state';
import { SkeletonRows, SkeletonStats } from '@/components/prompthub/ui/skeleton';
import { Panel, Section } from '@/components/prompthub/ui/surface';
import { UsageHistoryList } from '@/features/history/components/usage-history-list';
import { PromptCard } from '@/features/prompts/components/prompt-card';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { CURRENT_USER, LIMITS } from '@/lib/prompthub/constants';
import {
  findCategoryName,
  selectCategoryDistribution,
  selectDashboardStats,
  selectPopularPrompts,
  selectRecentHistory,
  selectRecentPrompts,
} from '@/lib/prompthub/selectors';

export function DashboardView() {
  const { status, prompts, history, categories } = usePromptHub();

  const stats = useMemo(() => selectDashboardStats(prompts, history), [prompts, history]);
  const recent = useMemo(() => selectRecentPrompts(prompts, LIMITS.dashboardRecent), [prompts]);
  const popular = useMemo(() => selectPopularPrompts(prompts, LIMITS.dashboardPopular), [prompts]);
  const distribution = useMemo(() => selectCategoryDistribution(categories), [categories]);
  const recentHistory = useMemo(
    () => selectRecentHistory(history, LIMITS.dashboardHistory),
    [history]
  );
  const existingIds = useMemo(() => new Set(prompts.map((prompt) => prompt.id)), [prompts]);

  if (status === 'loading') {
    return (
      <div className="space-y-8">
        <SkeletonStats />
        <SkeletonRows rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">
            こんにちは、{CURRENT_USER.name}さん
          </h1>
          <p className="text-[15px] text-ph-muted">
            チームに共有されているプロンプトは{stats.teamShared}件です。今月は{stats.usageThisMonth}
            回使われました。
          </p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link href={`${PROMPTHUB_BASE}/prompts/new`}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            新しいプロンプトを登録
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          emphasis
          label="今月の利用回数"
          value={stats.usageThisMonth}
          unit="回"
          hint={`累計 ${stats.totalUsage} 回・チーム全体の記録`}
          icon={TrendingUp}
          className="sm:col-span-2"
        />
        <StatCard
          label="登録プロンプト数"
          value={stats.total}
          unit="件"
          hint={`うちチーム共有 ${stats.teamShared} 件`}
          icon={Sparkles}
        />
        <StatCard
          label="お気に入り"
          value={stats.favorites}
          unit="件"
          hint="よく使うものを手元に固定"
          icon={Star}
        />
      </div>

      <Panel className="grid grid-cols-1 divide-y divide-ph-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          { label: '平均評価', value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—', unit: '/ 5', icon: Star },
          { label: '登録メンバー', value: new Set(prompts.map((prompt) => prompt.author)).size, unit: '人', icon: Users },
          { label: 'カテゴリー数', value: categories.length, unit: '個', icon: BarChart3 },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-5 py-4">
            <item.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-ph-subtle" />
            <div>
              <p className="text-xs text-ph-muted">{item.label}</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-ph-fg">
                {item.value}
                <span className="ml-1 text-xs font-normal text-ph-subtle">{item.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </Panel>

      {prompts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="まだプロンプトが登録されていません"
          description="よく使っているAIへの指示文を1つ登録してみましょう。登録するとチーム全員が同じ品質で再利用できるようになります。"
          action={
            <Button asChild variant="primary">
              <Link href={`${PROMPTHUB_BASE}/prompts/new`}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                最初のプロンプトを登録
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Section
              title="よく使われているプロンプト"
              description="利用回数の多い順。チームで効果が出ている型です。"
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${PROMPTHUB_BASE}/prompts?sort=usage`}>すべて見る</Link>
                </Button>
              }
            >
              <Panel className="p-2">
                <ul>
                  {popular.map((prompt, index) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      categoryName={findCategoryName(categories, prompt.category)}
                      rank={index + 1}
                      highlightUsage
                    />
                  ))}
                </ul>
              </Panel>
            </Section>

            <Section
              title="最近追加したプロンプト"
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${PROMPTHUB_BASE}/prompts`}>一覧へ</Link>
                </Button>
              }
            >
              <Panel className="p-2">
                <ul>
                  {recent.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      categoryName={findCategoryName(categories, prompt.category)}
                    />
                  ))}
                </ul>
              </Panel>
            </Section>
          </div>

          <div className="space-y-6">
            <Section
              title="カテゴリー別の登録数"
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${PROMPTHUB_BASE}/categories`}>管理</Link>
                </Button>
              }
            >
              <Panel className="space-y-3 p-5">
                {distribution.map((category) => (
                  <div key={category.id}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate text-ph-fg">{category.name}</span>
                      <span className="shrink-0 tabular-nums text-ph-muted">
                        {category.promptCount}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ph-surface-2">
                      <div
                        className="h-full rounded-full bg-ph-accent"
                        style={{ width: `${category.ratio}%` }}
                      />
                    </div>
                  </div>
                ))}
              </Panel>
            </Section>

            <Section
              title="最近の利用"
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${PROMPTHUB_BASE}/history`}>履歴へ</Link>
                </Button>
              }
            >
              <Panel className="px-5 py-2">
                {recentHistory.length > 0 ? (
                  <UsageHistoryList entries={recentHistory} existingPromptIds={existingIds} compact />
                ) : (
                  <p className="flex items-center gap-2 py-6 text-sm text-ph-subtle">
                    <Clock aria-hidden="true" className="h-4 w-4" />
                    まだ利用履歴がありません。
                  </p>
                )}
              </Panel>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}
