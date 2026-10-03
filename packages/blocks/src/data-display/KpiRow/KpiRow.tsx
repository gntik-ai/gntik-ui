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
}

const COLS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
};

/**
 * KPI row: label, big number, delta (direction and sentiment are independent) and an optional
 * Sparkline. A description list, so each label is announced with its value.
 */
export function KpiRow({ items = KPI_ITEMS, variant = 'cards', showTrends = true, label = 'Key metrics', className }: KpiRowProps) {
  const strip = variant === 'strip';
  const cols = COLS[Math.min(items.length, 5)] ?? 'lg:grid-cols-4';
  return (
    <dl
      aria-label={label}
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2',
        cols,
        strip ? 'divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:divide-x lg:divide-y-0' : 'gap-4',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn('flex min-w-0 flex-col', strip ? 'px-5 py-4' : 'rounded-xl border border-border bg-card p-5 shadow-sm')}
        >
          <dt className={cn('truncate font-medium text-muted-foreground', strip ? 'text-[12px]' : 'text-[13px]')}>{item.label}</dt>
          <dd className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className={cn('font-semibold tracking-tight text-foreground tabular-nums', strip ? 'text-[22px]' : 'text-[26px]')}>
              {item.value}
            </span>
            {item.delta && <TrendDelta {...item.delta} />}
          </dd>
          {item.delta?.note && !strip && <dd className="mt-1 text-[12px] text-muted-foreground">{item.delta.note}</dd>}
          {showTrends && item.trend && item.trend.length > 1 && (
            <dd className="mt-3">
              <Sparkline data={item.trend} label={item.label} area tone={item.trendTone ?? 'primary'} width={240} height={40} className="block h-auto w-full" />
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
