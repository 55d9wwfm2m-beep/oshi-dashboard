import { Star } from 'lucide-react';
import { cn } from '@/lib/prompthub/utils';

const MAX_STARS = 5;

interface RatingStarsProps {
  value: number;
  /** 数値も併記する */
  showValue?: boolean;
  className?: string;
}

/** 表示専用の評価。0 は未評価として扱う。 */
export function RatingStars({ value, showValue = true, className }: RatingStarsProps) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      title={value > 0 ? `評価 ${value.toFixed(1)} / 5` : '未評価'}
    >
      <span aria-hidden="true" className="flex">
        {Array.from({ length: MAX_STARS }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'h-3.5 w-3.5',
              index < rounded ? 'fill-ph-warning text-ph-warning' : 'text-ph-border-strong'
            )}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-xs tabular-nums text-ph-muted">
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
      ) : null}
      <span className="sr-only">{value > 0 ? `評価 ${value.toFixed(1)}／5` : '未評価'}</span>
    </span>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

/** 利用記録用の評価入力（ラジオグループとして操作できる） */
export function RatingInput({ value, onChange, label = '今回の評価' }: RatingInputProps) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1">
      {Array.from({ length: MAX_STARS }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue}点`}
            onClick={() => onChange(starValue)}
            className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-ph-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent"
          >
            <Star
              aria-hidden="true"
              className={cn(
                'h-5 w-5',
                active ? 'fill-ph-warning text-ph-warning' : 'text-ph-border-strong'
              )}
            />
          </button>
        );
      })}
      <span className="ml-1 text-sm tabular-nums text-ph-muted">{value} / 5</span>
    </div>
  );
}
