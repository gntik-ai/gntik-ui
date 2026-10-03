import { cx, identity, type ValueFormatter } from './format';
import { field, numField, type DataKey } from './shared';

const BAR_LIST_BG = {
  primary: 'bg-primary/20',
  violet: 'bg-category-violet/20',
  cyan: 'bg-category-cyan/20',
  amber: 'bg-category-amber/20',
  rose: 'bg-category-rose/20',
} as const;

export interface BarListProps<T extends object> {
  data: readonly T[];
  index: DataKey<T>;
  category: DataKey<T>;
  valueFormatter?: ValueFormatter;
  color?: keyof typeof BAR_LIST_BG;
  sortOrder?: 'desc' | 'asc' | 'none';
  'aria-label'?: string;
  className?: string;
}

/** Axis-less ranked list: label inside a token-tinted bar, value on the right. */
export function BarList<T extends object>({
  data,
  index,
  category,
  valueFormatter = identity,
  color = 'primary',
  sortOrder = 'desc',
  className,
  'aria-label': ariaLabel = 'Bar list',
}: BarListProps<T>) {
  const rows = data.slice();
  if (sortOrder === 'desc') rows.sort((a, b) => numField(b, category) - numField(a, category));
  else if (sortOrder === 'asc') rows.sort((a, b) => numField(a, category) - numField(b, category));
  const max = Math.max(...rows.map((d) => numField(d, category)), 1);
  return (
    <ul aria-label={ariaLabel} className={cx('flex flex-col gap-2 font-sans', className)}>
      {rows.map((r, i) => {
        const value = numField(r, category);
        const pct = Math.max((value / max) * 100, 1.5);
        return (
          <li key={i} className="flex items-center gap-3">
            <div className="relative h-9 min-w-0 flex-1">
              <div aria-hidden className={cx('absolute inset-y-0 left-0 rounded-md', BAR_LIST_BG[color])} style={{ width: `${pct}%` }} />
              <div className="relative z-10 flex h-full items-center px-2.5">
                <span className="truncate text-[13px] text-foreground">{String(field(r, index))}</span>
              </div>
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-[13px] tabular-nums text-foreground">
              {valueFormatter(value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
