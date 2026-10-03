import type { ReactNode, Ref, SVGAttributes } from 'react';
import { createFormatters, type I18nFormatters } from '../../i18n/format';
import { useI18n } from '../../i18n/I18nProvider';
import { en } from '../../i18n/messages/en';
import { cn } from '../../utils/cn';
import { sparklineVariants, type SparklineVariantProps } from './sparkline.variants';

export type SparklineMarker = 'min' | 'max' | 'last';

export interface SparklineProps extends Omit<SVGAttributes<SVGSVGElement>, 'className' | 'width' | 'height'>, SparklineVariantProps {
  className?: string;
  ref?: Ref<SVGSVGElement>;
  /** The series, oldest first. */
  data: readonly number[];
  /** `line` (default) or `bar`. */
  variant?: 'line' | 'bar';
  /** Fill the area under the line (line variant). */
  area?: boolean;
  /** Dots on the lowest, highest and/or last point. */
  markers?: readonly SparklineMarker[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  /** What the series measures, used in the generated accessible name ("Requests"). */
  label?: string;
  /** Formats values in the generated accessible name. */
  formatValue?: (value: number) => string;
}

const EN = createFormatters('en', en);

/**
 * "Requests: trending up 12% from 140 to 157 over 12 points (low 120, high 160)". Pass the
 * `useI18n()` value as `i18n` for another language; English otherwise.
 */
export function describeTrend(
  data: readonly number[],
  label?: string,
  format?: (value: number) => string,
  i18n: Pick<I18nFormatters, 't' | 'formatNumber'> = EN,
) {
  const { t } = i18n;
  const name = label ?? t('common.trend');
  const fmt = format ?? ((v: number) => i18n.formatNumber(v, { maximumFractionDigits: 2 }));
  const first = data[0];
  const last = data[data.length - 1];
  if (first === undefined || last === undefined) return t('sparkline.noData', { label: name });
  if (data.length === 1) return t('sparkline.single', { label: name, value: fmt(first) });
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pct = first !== 0 ? Math.round(((last - first) / Math.abs(first)) * 100) : null;
  const direction = t(last > first ? 'sparkline.up' : last < first ? 'sparkline.down' : 'sparkline.flat');
  const change = pct !== null && last !== first ? ` ${i18n.formatNumber(Math.abs(pct))}%` : '';
  return t('sparkline.summary', { label: name, direction, change, first: fmt(first), last: fmt(last), count: data.length, min: fmt(min), max: fmt(max) });
}

/**
 * Inline SVG trend without axes or tooltip — the shape only. Pure SVG (no chart library),
 * coloured with token classes; exposed as role="img" with a generated summary of the trend.
 */
export function Sparkline({
  data,
  variant = 'line',
  area = false,
  markers = [],
  tone,
  width = 120,
  height = 32,
  strokeWidth = 1.75,
  label,
  formatValue,
  className,
  ...props
}: SparklineProps) {
  const i18n = useI18n();
  const s = sparklineVariants({ tone });
  const name = props['aria-label'] ?? describeTrend(data, label, formatValue, i18n);
  const n = data.length;
  const min = n ? Math.min(...data) : 0;
  const max = n ? Math.max(...data) : 0;
  const pad = markers.length ? 3 : strokeWidth / 2;
  const innerH = height - pad * 2;

  const svg = (children: ReactNode) => (
    <svg
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn(s.root(), className)}
      {...props}
      aria-label={name}
    >
      {children}
    </svg>
  );
  if (!n) return svg(null);

  if (variant === 'bar') {
    const lo = Math.min(0, min);
    const span = max - lo || 1;
    const slot = width / n;
    const gap = Math.min(2, slot * 0.25);
    return svg(
      data.map((v, i) => {
        const h = Math.max(1, ((v - lo) / span) * (height - 1));
        return <rect key={i} className={s.bar()} x={i * slot + gap / 2} y={height - h} width={Math.max(1, slot - gap)} height={h} rx={1} />;
      }),
    );
  }

  const span = max - min;
  const x = (i: number) => (n === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (n - 1));
  const y = (v: number) => (span === 0 ? height / 2 : pad + innerH - ((v - min) / span) * innerH);
  const points = data.map((v, i) => [x(i), y(v)] as const);
  const path = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(2)} ${py.toFixed(2)}`).join(' ');
  const first = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = first && lastPoint ? `${path} L${lastPoint[0].toFixed(2)} ${height} L${first[0].toFixed(2)} ${height} Z` : '';
  const markerAt = (kind: SparklineMarker) => {
    const index = kind === 'last' ? n - 1 : data.indexOf(kind === 'min' ? min : max);
    const point = points[index];
    if (!point) return null;
    return (
      <circle
        key={kind}
        data-marker={kind}
        className={kind === 'last' ? s.marker() : s.extreme()}
        cx={point[0]}
        cy={point[1]}
        r={kind === 'last' ? 2.75 : 2.25}
        strokeWidth={kind === 'last' ? 1.5 : 1.25}
      />
    );
  };
  return svg(
    <>
      {area && <path className={s.area()} d={areaPath} />}
      <path className={s.line()} d={path} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {markers.filter((m, i) => markers.indexOf(m) === i).map(markerAt)}
    </>,
  );
}
