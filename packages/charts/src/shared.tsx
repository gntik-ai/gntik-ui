import type { ReactElement, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import type { ChartColor, ChartTheme } from './theme';
import { cx, type ValueFormatter } from './format';

/** Keys of a datum (string keys only). */
export type DataKey<T> = Extract<keyof T, string>;

/** Props shared by every cartesian chart (Tremor-like API). */
export interface BaseChartProps<T extends object> {
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

export interface ChartFrameProps {
  label: string;
  height: number;
  legend?: ReactNode;
  className?: string;
  children: ReactElement;
}

/** Figure wrapper: accessible name, optional legend above, responsive plot area. */
export function ChartFrame({ label, height, legend, className, children }: ChartFrameProps) {
  return (
    <div role="figure" aria-label={label} className={cx('w-full font-sans', className)}>
      {legend}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
