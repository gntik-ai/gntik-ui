import { useId, useState, type KeyboardEvent } from 'react';
import { cx, identity, type ValueFormatter } from './format';
import { divergingRamp, rampIndex, sequentialRamp } from './palette';
import { accessibleName, field, type DataKey } from './shared';
import { ChartDataTable, chartStateView, resolveState, type ChartStateProps } from './states';
import type { ChartColor } from './theme';

export interface HeatmapProps<T extends object> extends ChartStateProps {
  /** One row per datum (cohort, day…). */
  data: readonly T[];
  /** Key of the row label. */
  index: DataKey<T>;
  /** Column keys (weeks, hours…), in display order. Missing / non-numeric values render as empty cells. */
  categories: ReadonlyArray<DataKey<T>>;
  /** `sequential` (default) for magnitudes, `diverging` for signed values around `domain[1]`. */
  scale?: 'sequential' | 'diverging';
  /** `[min, max]` or, for diverging, `[min, mid, max]`. Default: the data extent (mid 0). */
  domain?: readonly [number, number] | readonly [number, number, number];
  /** Number of colour steps. Default 6 (sequential) / 7 (diverging). */
  steps?: number;
  /** Hue of the sequential scale. Default `primary`. */
  color?: ChartColor;
  valueFormatter?: ValueFormatter;
  /** Print the value inside each cell. */
  showValues?: boolean;
  /** Show the colour scale under the grid. Default `true`. */
  showScale?: boolean;
  /** Cell height in px. */
  cellHeight?: number;
  /** Row header column label (table fallback). Default: `index`. */
  rowHeader?: string;
  'aria-label'?: string;
  title?: string;
  className?: string;
}

function extent(values: readonly number[]): [number, number] {
  if (!values.length) return [0, 1];
  return [Math.min(...values), Math.max(...values)];
}

const cellFocus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

/**
 * Cohort / time grid coloured with a sequential or diverging token ramp. The colour grid is
 * a single keyboard stop (arrow keys move the active cell, Home/End jump within the row) with a
 * live readout; screen readers get the full data table (`dataTable`, on by default).
 */
export function Heatmap<T extends object>({
  data,
  index,
  categories,
  scale = 'sequential',
  domain,
  steps,
  color = 'primary',
  valueFormatter = identity,
  showValues = false,
  showScale = true,
  cellHeight = 28,
  rowHeader,
  title,
  className,
  'aria-label': ariaLabel,
  state,
  emptyMessage,
  errorMessage,
  onRetry,
  dataTable = true,
}: HeatmapProps<T>) {
  const id = useId();
  const [active, setActive] = useState<readonly [number, number] | null>(null);
  const name = accessibleName('Heatmap', ariaLabel, title, []);
  const diverging = scale === 'diverging';
  const count = steps ?? (diverging ? 7 : 6);
  const ramp = diverging ? divergingRamp(count) : sequentialRamp(count, { color });
  const value = (r: number, c: number): number | null => {
    const row = data[r];
    const key = categories[c];
    if (!row || key === undefined) return null;
    const v = field(row, key);
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };
  const all = data.flatMap((_, r) => categories.map((__, c) => value(r, c))).filter((v): v is number => v !== null);
  const [lo, hi] = extent(all);
  const dom: readonly [number, number] | readonly [number, number, number] =
    domain ?? (diverging ? [Math.min(lo, 0), 0, Math.max(hi, 0)] : [lo, hi]);
  const effective = resolveState(state, all.length);
  const placeholder = chartStateView(effective, {
    height: Math.max(data.length, 4) * (cellHeight + 3),
    emptyMessage,
    errorMessage,
    onRetry,
  });

  // Value labels sit on a card-coloured chip: foreground on card is AA in every theme,
  // whatever ramp step is underneath (mid steps fail with any single on-colour text).
  const cellStyle = (v: number) => ({ fill: ramp[rampIndex(v, dom, count)] ?? ramp[0] });

  const rowLabel = (r: number) => {
    const row = data[r];
    return row ? String(field(row, index)) : '';
  };
  const describe = ([r, c]: readonly [number, number]) => {
    const v = value(r, c);
    return `${rowLabel(r)} · ${categories[c] ?? ''}: ${v === null ? 'no data' : valueFormatter(v)}`;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const [r, c] = active ?? [0, 0];
    const lastR = data.length - 1;
    const lastC = categories.length - 1;
    const next: Record<string, readonly [number, number]> = {
      ArrowRight: [r, Math.min(lastC, c + 1)],
      ArrowLeft: [r, Math.max(0, c - 1)],
      ArrowDown: [Math.min(lastR, r + 1), c],
      ArrowUp: [Math.max(0, r - 1), c],
      Home: [r, 0],
      End: [r, lastC],
    };
    const to = next[e.key];
    if (to) {
      e.preventDefault();
      setActive(active ? to : [0, 0]);
    } else if (e.key === 'Escape') setActive(null);
  };

  if (placeholder)
    return (
      <div
        role="figure"
        aria-label={name}
        aria-busy={effective === 'loading' || undefined}
        className={cx('w-full font-sans', className)}
      >
        {placeholder}
      </div>
    );

  const columns = `minmax(4.5rem, max-content) repeat(${categories.length}, minmax(1.75rem, 1fr))`;
  return (
    <div role="figure" aria-label={name} className={cx('w-full font-sans', className)}>
      <div
        role="group"
        tabIndex={0}
        aria-label={`${name}: colour grid, use the arrow keys to read cells`}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((a) => a ?? [0, 0])}
        onBlur={() => setActive(null)}
        onMouseLeave={() => setActive(null)}
        className={cx('rounded-md', cellFocus)}
      >
        <div aria-hidden className="grid gap-[3px]" style={{ gridTemplateColumns: columns }}>
          <div />
          {categories.map((c) => (
            <div key={c} className="truncate pb-1 text-center text-[11px] text-muted-foreground">
              {c}
            </div>
          ))}
          {data.map((_, r) => [
            <div
              key={`h${r}`}
              className="flex items-center truncate pr-2 text-[11.5px] text-muted-foreground"
              style={{ height: cellHeight }}
            >
              {rowLabel(r)}
            </div>,
            ...categories.map((c, ci) => {
              const v = value(r, ci);
              const s = v === null ? null : cellStyle(v);
              const on = active?.[0] === r && active[1] === ci;
              return (
                <div
                  key={`${r}-${c}`}
                  data-cell={`${r}-${ci}`}
                  data-fill={s?.fill}
                  onMouseEnter={() => setActive([r, ci])}
                  className={cx(
                    'flex items-center justify-center rounded-[3px] font-mono text-[10.5px] tabular-nums',
                    !s && 'border border-dashed border-border',
                    on && 'outline-2 outline-offset-1 outline-foreground',
                  )}
                  style={{ height: cellHeight, background: s?.fill }}
                >
                  {showValues && v !== null ? (
                    <span className="rounded-[2px] bg-card px-1 leading-4 text-foreground">{valueFormatter(v)}</span>
                  ) : null}
                </div>
              );
            }),
          ])}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p
          id={`${id}-readout`}
          data-heatmap-readout=""
          aria-live="polite"
          className="min-h-[1.25rem] text-[12px] text-muted-foreground"
        >
          {active ? describe(active) : ''}
        </p>
        {showScale && (
          <div aria-hidden className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-mono tabular-nums">{valueFormatter(dom[0])}</span>
            <span className="flex">
              {ramp.map((f, i) => (
                <span key={i} className="h-2.5 w-4 first:rounded-l-sm last:rounded-r-sm" style={{ background: f }} />
              ))}
            </span>
            <span className="font-mono tabular-nums">{valueFormatter(dom[dom.length - 1] ?? dom[0])}</span>
          </div>
        )}
      </div>
      {dataTable && (
        <ChartDataTable
          caption={name}
          columns={[rowHeader ?? index, ...categories]}
          rows={data.map((_, r) => [
            rowLabel(r),
            ...categories.map((__, c) => {
              const v = value(r, c);
              return v === null ? '—' : valueFormatter(v);
            }),
          ])}
        />
      )}
    </div>
  );
}
