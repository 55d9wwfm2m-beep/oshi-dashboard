import Link from 'next/link';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { AiToolBadge } from '@/features/prompts/components/ai-tool-badge';
import { RatingStars } from '@/features/prompts/components/rating-stars';
import { formatDateTime, formatRelative } from '@/lib/prompthub/utils';
import type { UsageHistory } from '@/types/prompthub';

interface UsageHistoryListProps {
  entries: UsageHistory[];
  /** 存在するプロンプトのIDセット。削除済みはリンクにしない。 */
  existingPromptIds: Set<string>;
  /** ダッシュボードなど、狭い場所では簡易表示にする */
  compact?: boolean;
}

export function UsageHistoryList({ entries, existingPromptIds, compact = false }: UsageHistoryListProps) {
  if (compact) {
    return (
      <ul className="divide-y divide-ph-border">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ph-fg">{entry.promptTitle}</p>
              <p className="mt-0.5 text-xs text-ph-subtle">
                {entry.userName}・{formatRelative(entry.usedAt)}
              </p>
            </div>
            <AiToolBadge tool={entry.aiTool} compact />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ph-border">
      {/* デスクトップ: 表形式 */}
      <table className="hidden w-full table-fixed border-collapse text-sm md:table">
        <caption className="sr-only">プロンプトの利用履歴</caption>
        <thead>
          <tr className="border-b border-ph-border bg-ph-surface-2 text-left text-xs text-ph-muted">
            <th scope="col" className="w-[42%] px-4 py-2.5 font-medium">
              プロンプト名
            </th>
            <th scope="col" className="w-[20%] px-4 py-2.5 font-medium">
              使用日時
            </th>
            <th scope="col" className="w-[14%] px-4 py-2.5 font-medium">
              対応AI
            </th>
            <th scope="col" className="w-[12%] px-4 py-2.5 font-medium">
              利用者
            </th>
            <th scope="col" className="w-[12%] px-4 py-2.5 font-medium">
              評価
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ph-border bg-ph-surface">
          {entries.map((entry) => (
            <tr key={entry.id} className="transition-colors hover:bg-ph-surface-2/60">
              <td className="px-4 py-3">
                {existingPromptIds.has(entry.promptId) ? (
                  <Link
                    href={`${PROMPTHUB_BASE}/prompts/${entry.promptId}`}
                    className="block truncate font-medium text-ph-fg hover:text-ph-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent"
                  >
                    {entry.promptTitle}
                  </Link>
                ) : (
                  <span className="block truncate text-ph-subtle" title="このプロンプトは削除されています">
                    {entry.promptTitle}（削除済み）
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-ph-muted">{formatDateTime(entry.usedAt)}</td>
              <td className="px-4 py-3">
                <AiToolBadge tool={entry.aiTool} />
              </td>
              <td className="truncate px-4 py-3 text-ph-muted">{entry.userName}</td>
              <td className="px-4 py-3">
                <RatingStars value={entry.rating} showValue={false} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* モバイル: 横スクロールさせず、縦積みのカード表示にする */}
      <ul className="divide-y divide-ph-border bg-ph-surface md:hidden">
        {entries.map((entry) => (
          <li key={entry.id} className="space-y-2 px-4 py-3.5">
            {existingPromptIds.has(entry.promptId) ? (
              <Link
                href={`${PROMPTHUB_BASE}/prompts/${entry.promptId}`}
                className="block text-sm font-medium text-ph-fg hover:text-ph-accent"
              >
                {entry.promptTitle}
              </Link>
            ) : (
              <p className="text-sm text-ph-subtle">{entry.promptTitle}（削除済み）</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ph-subtle">
              <span>{formatDateTime(entry.usedAt)}</span>
              <span>{entry.userName}</span>
              <AiToolBadge tool={entry.aiTool} />
              <RatingStars value={entry.rating} showValue={false} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
