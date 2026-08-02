'use client';

import {
  AlertTriangle,
  CircleCheck,
  Copy,
  History,
  Pencil,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { Panel, Section } from '@/components/prompthub/ui/surface';
import { cn, formatDate, formatDateTime } from '@/lib/prompthub/utils';
import type { Prompt } from '@/types/prompthub';
import { AiToolBadgeList } from './ai-tool-badge';
import { CategoryBadge, VisibilityBadge } from './category-badge';
import { PromptPreview } from './prompt-preview';
import { RatingStars } from './rating-stars';

interface PromptDetailProps {
  prompt: Prompt;
  categoryName: string;
  onCopy: () => void;
  onToggleFavorite: () => void;
  onRecordUsage: () => void;
  onDelete: () => void;
}

export function PromptDetail({
  prompt,
  categoryName,
  onCopy,
  onToggleFavorite,
  onRecordUsage,
  onDelete,
}: PromptDetailProps) {
  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">{prompt.title}</h1>
          <p className="max-w-3xl text-[15px] leading-relaxed text-ph-muted">{prompt.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge name={categoryName} />
          <AiToolBadgeList tools={prompt.aiTools} />
          <VisibilityBadge visibility={prompt.visibility} />
        </div>

        {prompt.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="タグ">
            {prompt.tags.map((tag) => (
              <li key={tag} className="text-xs text-ph-subtle">
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}

        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-ph-border py-3 text-sm">
          <div className="flex items-center gap-2">
            <dt className="text-ph-subtle">作成者</dt>
            <dd className="font-medium text-ph-fg">{prompt.author}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-ph-subtle">更新日</dt>
            <dd className="text-ph-muted">{formatDate(prompt.updatedAt)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-ph-subtle">利用回数</dt>
            <dd className="font-medium tabular-nums text-ph-fg">{prompt.usageCount}回</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-ph-subtle">評価</dt>
            <dd>
              <RatingStars value={prompt.rating} />
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-ph-subtle">バージョン</dt>
            <dd className="tabular-nums text-ph-muted">v{prompt.version}</dd>
          </div>
        </dl>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={onCopy} className="min-h-[44px]">
          <Copy aria-hidden="true" className="h-4 w-4" />
          コピー
        </Button>
        <Button variant="secondary" onClick={onRecordUsage} className="min-h-[44px]">
          <CircleCheck aria-hidden="true" className="h-4 w-4" />
          使用したことを記録
        </Button>
        <Button
          variant="secondary"
          onClick={onToggleFavorite}
          aria-pressed={prompt.favorite}
          className="min-h-[44px]"
        >
          <Star
            aria-hidden="true"
            className={cn('h-4 w-4', prompt.favorite ? 'fill-ph-warning text-ph-warning' : '')}
          />
          {prompt.favorite ? 'お気に入り解除' : 'お気に入り'}
        </Button>
        <Button asChild variant="secondary" className="min-h-[44px]">
          <Link href={`${PROMPTHUB_BASE}/prompts/${prompt.id}/improve`}>
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            AIで改善
          </Link>
        </Button>
        <Button asChild variant="secondary" className="min-h-[44px]">
          <Link href={`${PROMPTHUB_BASE}/prompts/${prompt.id}/edit`}>
            <Pencil aria-hidden="true" className="h-4 w-4" />
            編集
          </Link>
        </Button>
        <Button variant="danger-outline" onClick={onDelete} className="min-h-[44px] sm:ml-auto">
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          削除
        </Button>
      </div>

      {prompt.caution ? (
        <div className="flex items-start gap-3 rounded-md border border-ph-warning/30 bg-ph-warning-soft px-4 py-3.5">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ph-warning" />
          <div>
            <p className="text-sm font-medium text-ph-warning">使用上の注意</p>
            <p className="mt-1 text-sm leading-relaxed text-ph-warning">{prompt.caution}</p>
          </div>
        </div>
      ) : null}

      <Section
        title="プロンプト本文"
        description="そのままコピーしてAIツールへ貼り付けられます。"
        action={
          <Button variant="ghost" size="sm" onClick={onCopy}>
            <Copy aria-hidden="true" className="h-4 w-4" />
            本文をコピー
          </Button>
        }
      >
        <PromptPreview content={prompt.content} />
      </Section>

      {prompt.example ? (
        <Section title="使用例" description="入力と出力のイメージです。">
          <Panel className="px-4 py-3.5">
            <p className="ph-prewrap text-sm leading-relaxed text-ph-muted">{prompt.example}</p>
          </Panel>
        </Section>
      ) : null}

      <Section title="更新履歴" description="いつ・誰が・何を変えたかを記録しています。">
        <ol className="space-y-0">
          {[...prompt.revisions].reverse().map((revision, index) => (
            <li key={`${revision.version}-${revision.updatedAt}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    index === 0 ? 'bg-ph-accent' : 'bg-ph-border-strong'
                  )}
                />
                {index < prompt.revisions.length - 1 ? (
                  <span aria-hidden="true" className="w-px flex-1 bg-ph-border" />
                ) : null}
              </div>
              <div className="pb-5">
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-ph-fg">v{revision.version}</span>
                  <span className="text-ph-muted">{revision.note}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ph-subtle">
                  <History aria-hidden="true" className="h-3 w-3" />
                  {formatDateTime(revision.updatedAt)}・{revision.author}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </article>
  );
}
