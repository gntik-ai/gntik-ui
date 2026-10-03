import type { Ref, SVGAttributes } from 'react';
import { cx } from './format';

/** Same tones as the `@gntik-ai/ui` Sparkline, so the two can sit side by side in stat cards. */
export type MiniBarTone = 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'neutral';

const TONE_TOKEN: Record<MiniBarTone, string> = {
  primary: '--primary',
  success: '--success',
  warning: '--warning',
  destructive: '--destructive',
  info: '--info',
  neutral: '--muted-foreground',
};

export interface MiniBarProps extends Omit<SVGAttributes<SVGSVGElement>, 'className' | 'width' | 'height'> {
  className?: string;
  ref?: Ref<SVGSVGElement>;
  /** The series, oldest first. */
  data: readonly number[];
  /** Per-bar labels (e.g. dates) for hover titles and the accessible summary. */
  labels?: readonly string[];
  tone?: MiniBarTone;
  /** Which bar is drawn at full strength; the rest are muted. Default `last`. */
  highlight?: 'last' | 'max' | 'min' | 'none' | number;
  width?: number;
  height?: number;
  /** What the series measures, used in the generated accessible name ("Deployments"). */
  label?: string;
  formatValue?: (value: number) => string;
}

const fmtDefault = (v: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(v);

/** "Deployments: 12 bars, latest 9, low 2, high 14, total 84". */
export function describeBars(data: readonly number[], label = 'Bars', format = fmtDefault): string {
  const last = data[data.length - 1];
  if (last === undefined) return `${label}: no data`;
  const total = data.reduce((s, v) => s + v, 0);
  return `${label}: ${data.length} bars, latest ${format(last)}, low ${format(Math.min(...data))}, high ${format(Math.max(...data))}, total ${format(total)}`;
}

function highlightIndex(data: readonly number[], h: MiniBarProps['highlight']): number {
  if (typeof h === 'number') return h;
  if (h === 'last') return data.length - 1;
  if (h === 'max') return data.indexOf(Math.max(...data));
  if (h === 'min') return data.indexOf(Math.min(...data));
  return -1;
}

/**
 * Sparkline-sized bar chart (pure SVG, no axes): drop-in next to `Sparkline variant="bar"`,
 * with a highlighted bar, per-bar hover titles and a generated `role="img"` summary.
 */
export function MiniBar({
  data,
  labels,
  tone = 'primary',
  highlight = 'last',
  width = 120,
  height = 32,
  label,
  formatValue = fmtDefault,
  className,
  ...props
}: MiniBarProps) {
  const name = props['aria-label'] ?? describeBars(data, label, formatValue);
  const token = TONE_TOKEN[tone];
  const n = data.length;
  const lo = n ? Math.min(0, ...data) : 0;
  const hi = n ? Math.max(0, ...data) : 0;
  const span = hi - lo || 1;
  const zero = height - ((0 - lo) / span) * height;
  const slot = n ? width / n : width;
  const gap = Math.min(2, slot * 0.25);
  const hl = highlightIndex(data, highlight);
  return (
    <svg
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cx('inline-block shrink-0 overflow-visible align-middle', className)}
      {...props}
      aria-label={name}
    >
      {data.map((v, i) => {
        const h = Math.max(1, (Math.abs(v) / span) * height);
        const y = v >= 0 ? zero - h : zero;
        return (
          <rect
            key={i}
            data-highlight={i === hl || undefined}
            x={i * slot + gap / 2}
            y={y}
            width={Math.max(1, slot - gap)}
            height={h}
            rx={1}
            fill={i === hl || hl < 0 ? `hsl(var(${token}))` : `hsl(var(${token}) / 0.4)`}
          >
            <title>{`${labels?.[i] ?? `#${i + 1}`}: ${formatValue(v)}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}
