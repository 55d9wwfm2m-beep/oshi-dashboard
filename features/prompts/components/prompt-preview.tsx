import { Fragment } from 'react';
import { cn } from '@/lib/prompthub/utils';

interface PromptPreviewProps {
  content: string;
  className?: string;
  /** 空のときに表示する文言 */
  emptyMessage?: string;
}

const HEADING_PATTERN = /^\s*(#{1,6})\s+(.*)$/;
const VARIABLE_SPLIT_PATTERN = /(\{\{[^}]*\}\})/g;
// テスト用は非グローバルにする（グローバル正規表現の lastIndex による誤判定を避けるため）
const VARIABLE_TEST_PATTERN = /^\{\{[^}]*\}\}$/;

/** {{ 変数 }} を強調表示する */
function renderLine(line: string) {
  const parts = line.split(VARIABLE_SPLIT_PATTERN);
  return parts.map((part, index) =>
    VARIABLE_TEST_PATTERN.test(part) ? (
      <span
        key={index}
        className="rounded bg-ph-accent-soft px-1 py-0.5 font-medium text-ph-accent"
      >
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );
}

/**
 * 入力中のプロンプトをそのままの改行で表示するプレビュー。
 * 見出し（# 〜）と変数だけを軽く装飾し、実際にAIへ渡る文字列との差を作らない。
 */
export function PromptPreview({ content, className, emptyMessage }: PromptPreviewProps) {
  const trimmed = content.trim();

  if (!trimmed) {
    return (
      <div
        className={cn(
          'flex min-h-[180px] items-center justify-center rounded-md border border-dashed border-ph-border px-6 text-center text-sm text-ph-subtle',
          className
        )}
      >
        {emptyMessage ?? '本文を入力すると、ここにプレビューが表示されます。'}
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border border-ph-border bg-ph-surface-2/60 px-4 py-3.5', className)}>
      <div className="ph-mono ph-prewrap text-ph-fg">
        {content.split('\n').map((line, index) => {
          const heading = HEADING_PATTERN.exec(line);
          if (heading) {
            return (
              <p key={index} className="mt-3 font-semibold text-ph-accent first:mt-0">
                {heading[2]}
              </p>
            );
          }
          // 空行も高さを保つ
          if (line.trim() === '') return <p key={index}>&nbsp;</p>;
          return <p key={index}>{renderLine(line)}</p>;
        })}
      </div>
    </div>
  );
}
