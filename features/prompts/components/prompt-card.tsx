import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { cn, formatRelative } from '@/lib/prompthub/utils';
import type { Prompt } from '@/types/prompthub';
import { AiToolBadgeList } from './ai-tool-badge';
import { CategoryBadge } from './category-badge';
import { RatingStars } from './rating-stars';

interface PromptCardProps {
  prompt: Prompt;
  categoryName: string;
  /** ランキング表示の順位（1始まり）。指定するとカード左に順位を出す。 */
  rank?: number;
  /** 利用回数を主役にする（よく使われているプロンプト用） */
  highlightUsage?: boolean;
}

/** ダッシュボードなどで使う、1件を要約表示するカード */
export function PromptCard({ prompt, categoryName, rank, highlightUsage = false }: PromptCardProps) {
  return (
    <li className="relative flex items-start gap-3 rounded-md border border-transparent px-3 py-3 transition-colors hover:border-ph-border hover:bg-ph-surface-2/60">
      {rank !== undefined ? (
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold tabular-nums',
            rank <= 3 ? 'bg-ph-accent-soft text-ph-accent' : 'bg-ph-surface-2 text-ph-subtle'
          )}
        >
          {rank}
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-ph-fg">
          <Link
            href={`${PROMPTHUB_BASE}/prompts/${prompt.id}`}
            className="before:absolute before:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ph-accent"
          >
            {prompt.title}
          </Link>
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <CategoryBadge name={categoryName} />
          <AiToolBadgeList tools={prompt.aiTools.slice(0, 2)} compact />
        </div>
      </div>

      <div className="shrink-0 text-right">
        {highlightUsage ? (
          <>
            <p className="text-sm font-semibold tabular-nums text-ph-fg">
              {prompt.usageCount}
              <span className="ml-0.5 text-xs font-normal text-ph-subtle">回</span>
            </p>
            <RatingStars value={prompt.rating} showValue={false} className="mt-1" />
          </>
        ) : (
          <>
            <p className="text-xs text-ph-subtle">{formatRelative(prompt.createdAt)}</p>
            <p className="mt-1 truncate text-xs text-ph-subtle">{prompt.author}</p>
          </>
        )}
      </div>

      <ArrowUpRight aria-hidden="true" className="mt-0.5 hidden h-4 w-4 shrink-0 text-ph-subtle sm:block" />
    </li>
  );
}
