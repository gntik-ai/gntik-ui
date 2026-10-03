import { cn } from '@gntik-ai/ui';

/** Arrow shape of a change. */
export type DeltaDirection = 'up' | 'down' | 'flat';
/** Whether the change is good, bad or neither — independent of its direction (lower latency is good). */
export type DeltaSentiment = 'positive' | 'negative' | 'neutral';

export interface KpiDelta {
  /** Display text, e.g. "+12.4%". */
  value: string;
  direction: DeltaDirection;
  sentiment: DeltaSentiment;
  /** Comparison context, e.g. "vs. previous 24h". */
  note?: string;
}

const SENTIMENT_CLASS: Record<DeltaSentiment, string> = {
  positive: 'text-success-text',
  negative: 'text-destructive-text',
  neutral: 'text-muted-foreground',
};

const DIRECTION_TEXT: Record<DeltaDirection, string> = { up: 'Increased by', down: 'Decreased by', flat: 'Unchanged:' };
const SENTIMENT_TEXT: Record<DeltaSentiment, string> = { positive: 'favourable', negative: 'unfavourable', neutral: '' };

export interface TrendDeltaProps extends KpiDelta {
  className?: string;
}

/**
 * Mono delta with a triangle: the arrow follows `direction`, the colour follows `sentiment`.
 * Screen readers get the direction and sentiment in words.
 */
export function TrendDelta({ value, direction, sentiment, className }: TrendDeltaProps) {
  const sr = [DIRECTION_TEXT[direction], value, SENTIMENT_TEXT[sentiment] && `(${SENTIMENT_TEXT[sentiment]})`].filter(Boolean).join(' ');
  return (
    <span
      data-sentiment={sentiment}
      className={cn('inline-flex items-center gap-1 font-mono text-[12px] font-medium tabular-nums', SENTIMENT_CLASS[sentiment], className)}
    >
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden className="shrink-0">
        {direction === 'up' && <path d="M5 1.5 9 8.5H1z" fill="currentColor" />}
        {direction === 'down' && <path d="M5 8.5 1 1.5h8z" fill="currentColor" />}
        {direction === 'flat' && <path d="M1 4h8v2H1z" fill="currentColor" />}
      </svg>
      <span aria-hidden>{value}</span>
      <span className="sr-only">{sr}</span>
    </span>
  );
}
