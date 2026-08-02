'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { cn, formatRelative } from '@/lib/prompthub/utils';
import type { Prompt } from '@/types/prompthub';
import { AiToolBadgeList } from './ai-tool-badge';
import { CategoryBadge, VisibilityBadge } from './category-badge';
import { RatingStars } from './rating-stars';

interface PromptListItemProps {
  prompt: Prompt;
  categoryName: string;
  onToggleFavorite: (id: string) => void;
}

export function PromptListItem({ prompt, categoryName, onToggleFavorite }: PromptListItemProps) {
  return (
    <li className="relative bg-ph-surface transition-colors hover:bg-ph-surface-2/60">
      <div className="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[15px] font-semibold leading-6 text-ph-fg">
              <Link
                href={`${PROMPTHUB_BASE}/prompts/${prompt.id}`}
                className="before:absolute before:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ph-accent"
              >
                {prompt.title}
              </Link>
            </h3>
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ph-muted">
            {prompt.description}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <CategoryBadge name={categoryName} />
            <AiToolBadgeList tools={prompt.aiTools} />
            <VisibilityBadge visibility={prompt.visibility} />
          </div>

          <dl className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ph-subtle lg:hidden">
            <div className="flex gap-1">
              <dt>利用</dt>
              <dd className="tabular-nums text-ph-muted">{prompt.usageCount}回</dd>
            </div>
            <div className="flex gap-1">
              <dt className="sr-only">評価</dt>
              <dd>
                <RatingStars value={prompt.rating} />
              </dd>
            </div>
            <div className="flex gap-1">
              <dt className="sr-only">更新</dt>
              <dd>{formatRelative(prompt.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        <dl className="hidden w-[300px] shrink-0 grid-cols-3 items-center gap-3 text-xs lg:grid">
          <div>
            <dt className="text-ph-subtle">利用回数</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums text-ph-fg">
              {prompt.usageCount}
              <span className="ml-0.5 text-xs font-normal text-ph-subtle">回</span>
            </dd>
          </div>
          <div>
            <dt className="text-ph-subtle">評価</dt>
            <dd className="mt-0.5">
              <RatingStars value={prompt.rating} />
            </dd>
          </div>
          <div>
            <dt className="text-ph-subtle">更新</dt>
            <dd className="mt-0.5 text-ph-muted">{formatRelative(prompt.updatedAt)}</dd>
            <dd className="truncate text-ph-subtle">{prompt.author}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => onToggleFavorite(prompt.id)}
          aria-pressed={prompt.favorite}
          aria-label={
            prompt.favorite
              ? `「${prompt.title}」をお気に入りから外す`
              : `「${prompt.title}」をお気に入りに追加`
          }
          className="relative z-10 -m-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-ph-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent"
        >
          <Star
            aria-hidden="true"
            className={cn(
              'h-[18px] w-[18px]',
              prompt.favorite ? 'fill-ph-warning text-ph-warning' : 'text-ph-border-strong'
            )}
          />
        </button>
      </div>
    </li>
  );
}
