'use client';

import type { Category, Prompt } from '@/types/prompthub';
import { findCategoryName } from '@/lib/prompthub/selectors';
import { PromptListItem } from './prompt-list-item';

interface PromptListProps {
  prompts: Prompt[];
  categories: Category[];
  onToggleFavorite: (id: string) => void;
  /** リストの見出し（スクリーンリーダー用） */
  label?: string;
}

/**
 * テーブルとカードの中間の一覧。
 * 1件ごとの区切りは枠線1本にとどめ、情報量が多くても窮屈に見えないようにしている。
 */
export function PromptList({ prompts, categories, onToggleFavorite, label = 'プロンプト一覧' }: PromptListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-ph-border">
      <ul aria-label={label} className="divide-y divide-ph-border">
        {prompts.map((prompt) => (
          <PromptListItem
            key={prompt.id}
            prompt={prompt}
            categoryName={findCategoryName(categories, prompt.category)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </ul>
    </div>
  );
}
