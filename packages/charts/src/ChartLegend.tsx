import { useCallback, useState } from 'react';
import { cx } from './format';

export interface ChartLegendItem {
  key: string;
  label: string;
  /** Resolved colour (from `useChartTheme().color`). */
  color: string;
}

export interface ChartLegendProps {
  items: readonly ChartLegendItem[];
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
  className?: string;
}

const legendFocus =
  'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

/** Interactive legend: each entry is a toggle button that shows/hides its series. */
export function ChartLegend({ items, hidden, onToggle, className }: ChartLegendProps) {
  return (
    <div className={cx('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {items.map((it) => {
        const off = hidden.has(it.key);
        return (
          <button
            key={it.key}
            type="button"
            aria-pressed={!off}
            onClick={() => onToggle(it.key)}
            className={cx('group flex items-center gap-1.5 transition-opacity', off && 'opacity-40', legendFocus)}
          >
            <span
              aria-hidden
              className={cx('h-2.5 w-2.5 shrink-0 rounded-[3px]', off && 'grayscale')}
              style={{ background: it.color }}
            />
            <span
              className={cx(
                'text-[12.5px] text-muted-foreground transition-colors',
                off ? 'line-through' : 'group-hover:text-foreground',
              )}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Legend state: the set of hidden series keys plus a toggle. */
export function useHiddenSeries(): [ReadonlySet<string>, (key: string) => void] {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = useCallback((key: string) => {
    setHidden((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
  return [hidden, toggle];
}

export { legendFocus };
