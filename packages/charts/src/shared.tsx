import type { ReactElement, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import type { ChartColor, ChartTheme } from './theme';
import { cx, type ValueFormatter } from './format';
import { ChartDataTable, chartStateView, type ChartState, type ChartStateProps } from './states';

/** Keys of a datum (string keys only). */
export type DataKey<T> = Extract<keyof T, string>;

/** Props shared by every cartesian chart (Tremor-like API). */
export interface BaseChartProps<T extends object> extends ChartStateProps {
  data: readonly T[];
  /** Key of the x-axis (category) field. */
  index: DataKey<T>;
  /** Accessible name of the chart. Falls back to `title`, then to a generated summary. */
  'aria-label'?: string;
  /** Title rendered inside the SVG (`<title>`), also used as accessible name fallback. */
  title?: string;
  /** Longer description rendered inside the SVG (`<desc>`). */
  description?: string;
  colors?: readonly ChartColor[];
  valueFormatter?: ValueFormatter;
  showLegend?: boolean;
  showGrid?: boolean;
  /** Plot height in px (legend excluded). */
  height?: number;
  className?: string;
}

/** Reads a field from a datum without widening the public generic. */
export function field<T extends object>(d: T, key: string): unknown {
  return (d as Record<string, unknown>)[key];
}

export function numField<T extends object>(d: T, key: string): number {
  const v = field(d, key);
  return typeof v === 'number' ? v : 0;
}

export function accessibleName(kind: string, explicit: string | undefined, title: string | undefined, series: readonly string[]): string {
  return explicit ?? title ?? (series.length ? `${kind}: ${series.join(', ')}` : kind);
}

/** Shared axis styling: no tick lines, no axis line, muted labels. */
export function axisProps(t: ChartTheme) {
  return {
    stroke: t.axis,
    tickLine: false,
    axisLine: false,
    tick: { fill: t.text, fontSize: 11 },
  } as const;
}

export const CHART_MARGIN = { top: 6, right: 10, left: 0, bottom: 0 } as const;

export interface ChartFrameProps extends Pick<ChartStateProps, 'emptyMessage' | 'errorMessage' | 'onRetry'> {
  label: string;
  height: number;
  legend?: ReactNode;
  className?: string;
  /** Effective state (see `resolveState`). Default `ready`. */
  state?: ChartState;
  /** Data table fallback, rendered only when the chart is ready. */
  table?: ReactNode;
  children: ReactElement;
}

/** Figure wrapper: accessible name, optional legend above, responsive plot area, state placeholders. */
export function ChartFrame({ label, height, legend, className, state = 'ready', table, emptyMessage, errorMessage, onRetry, children }: ChartFrameProps) {
  const placeholder = chartStateView(state, { height, emptyMessage, errorMessage, onRetry });
  return (
    <div role="figure" aria-label={label} aria-busy={state === 'loading' || undefined} className={cx('w-full font-sans', className)}>
      {placeholder ?? (
        <>
          {legend}
          <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </div>
          {table}
        </>
      )}
    </div>
  );
}

/** Data table fallback for an index × categories dataset. */
export function cartesianTable<T extends object>(
  caption: string,
  data: readonly T[],
  index: string,
  categories: readonly string[],
  format: (value: unknown, key: string) => string,
) {
  return (
    <ChartDataTable
      caption={caption}
      columns={[index, ...categories]}
      rows={data.map((d) => [String(field(d, index)), ...categories.map((c) => format(field(d, c), c))])}
    />
  );
}
