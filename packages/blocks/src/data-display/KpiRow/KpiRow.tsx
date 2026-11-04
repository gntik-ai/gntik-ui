import { cn, Sparkline, type SparklineTone } from '@gntik-ai/ui';
import { TrendDelta, type KpiDelta } from '../shared/TrendDelta';
import { KPI_ITEMS } from './fixtures';

export interface KpiItem {
  id: string;
  label: string;
  /** Pre-formatted value ("38,921", "842 ms"). */
  value: string;
  delta?: KpiDelta;
  /** Optional series for a sparkline under the value, oldest first. */
  trend?: readonly number[];
  trendTone?: SparklineTone;
}

export interface KpiRowProps {
  /** 3–5 tiles read best; more wrap onto a new row. */
  items?: readonly KpiItem[];
  /** `cards` (one card per KPI, default) or `strip` (a single divided card, for page headers). */
  variant?: 'cards' | 'strip';
  /** Draw sparklines for items that have a `trend`. */
  showTrends?: boolean;
  /** Accessible name of the list. */
  label?: string;
  className?: string;
  /** Styles the container wrapper, including placement in a parent grid. */
  containerClassName?: string;
}

const COLS: Record<number, string> = {
  1: '@4xl:grid-cols-1',
  2: '@4xl:grid-cols-2',
  3: '@4xl:grid-cols-3',
  4: '@4xl:grid-cols-4',
  5: '@4xl:grid-cols-5',
};

// Only internal edges: no border on a row's last tile or on the list's last tile.
const STRIP_DIVIDERS: Record<number, string> = {
  1: '',
  2: '@4xl:[&>div:not(:nth-child(2n)):not(:last-child)]:border-e',
  3: '@4xl:[&>div:not(:nth-child(3n)):not(:last-child)]:border-e',
  4: '@4xl:[&>div:not(:nth-child(4n)):not(:last-child)]:border-e',
  5: '@4xl:[&>div:not(:nth-child(5n)):not(:last-child)]:border-e',
};

/**
 * KPI row: label, big number, delta (direction and sentiment are independent) and an optional
 * Sparkline. A description list, so each label is announced with its value.
 */
export function KpiRow({
  items = KPI_ITEMS,
  variant = 'cards',
  showTrends = true,
  label = 'Key metrics',
  className,
  containerClassName,
}: KpiRowProps) {
  const strip = variant === 'strip';
  const cols = COLS[Math.min(items.length, 5)] ?? '@4xl:grid-cols-4';
  return (
    <div className={cn('@container w-full min-w-0', containerClassName)}>
      <dl
        aria-label={label}
        className={cn(
          'grid grid-cols-1 @lg:grid-cols-2',
          cols,
          strip
            ? 'overflow-hidden rounded-xl border border-border bg-card shadow-sm [&>div]:border-border @max-lg:[&>div:not(:last-child)]:border-b @lg:@max-4xl:[&>div:nth-child(odd):not(:last-child)]:border-e'
            : 'gap-4',
          strip && (STRIP_DIVIDERS[Math.min(items.length, 5)] ?? STRIP_DIVIDERS[4]),
          className,
        )}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex min-w-0 flex-col',
              strip ? 'px-5 py-4' : 'rounded-xl border border-border bg-card p-5 shadow-sm',
            )}
          >
            <dt className={cn('truncate font-medium text-muted-foreground', strip ? 'text-[12px]' : 'text-[13px]')}>
              {item.label}
            </dt>
            <dd className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span
                className={cn(
                  'font-semibold tracking-tight text-foreground tabular-nums',
                  strip ? 'text-[22px]' : 'text-[26px]',
                )}
              >
                {item.value}
              </span>
              {item.delta && <TrendDelta {...item.delta} />}
            </dd>
            {item.delta?.note && !strip && (
              <dd className="mt-1 text-[12px] text-muted-foreground">{item.delta.note}</dd>
            )}
            {showTrends && item.trend && item.trend.length > 1 && (
              <dd className="mt-3">
                <Sparkline
                  data={item.trend}
                  label={item.label}
                  area
                  tone={item.trendTone ?? 'primary'}
                  width={240}
                  height={40}
                  className="block h-auto w-full"
                />
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
