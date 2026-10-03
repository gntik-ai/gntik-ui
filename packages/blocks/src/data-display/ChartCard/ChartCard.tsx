import { AreaChart, BarChart, Heatmap, LineChart, chartFmt, type ChartColor, type ChartStateProps, type HeatmapProps, type ValueFormatter } from '@gntik-ai/charts';
import { Card, CardAction, CardDescription, CardHeader, CardTitle, cn, Toggle, ToggleGroup } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { TrendDelta, type KpiDelta } from '../shared/TrendDelta';
import { COST_BY_RANGE, COST_RANGES, type CostPoint } from './fixtures';

export interface ChartCardRange {
  /** Range key ("7d"); also the key into `dataByRange`. */
  value: string;
  label: string;
  /** Optional headline for this range. */
  summary?: { value: string; delta?: KpiDelta };
}

/** Heatmap-only options of a ChartCard with `kind="heatmap"`. */
export type ChartCardHeatmapOptions = Pick<HeatmapProps<object>, 'scale' | 'domain' | 'steps' | 'showValues' | 'rowHeader'>;

export interface ChartCardProps<T extends object> extends ChartStateProps {
  title?: string;
  description?: string;
  ranges?: readonly ChartCardRange[];
  /** Chart rows per range key. */
  dataByRange?: Readonly<Record<string, readonly T[]>>;
  /** X-axis field (heatmap: the row label field). */
  index?: Extract<keyof T, string>;
  /** Series fields, one legend entry each (heatmap: the columns, in order). */
  categories?: ReadonlyArray<Extract<keyof T, string>>;
  /**
   * Chart type. `heatmap` renders an @gntik-ai/charts Heatmap: rows from `index`, columns from
   * `categories`, its hue from `colors[0]`, its colour scale as the legend (`showLegend`) and its
   * cells sized to fill `height`.
   */
  kind?: 'area' | 'line' | 'bar' | 'heatmap';
  /** Heatmap options (scale, domain, steps, showValues, rowHeader). */
  heatmap?: ChartCardHeatmapOptions;
  stacked?: boolean;
  colors?: readonly ChartColor[];
  valueFormatter?: ValueFormatter;
  showLegend?: boolean;
  /** Plot height in px (heatmap: the grid, column labels included). */
  height?: number;
  defaultRange?: string;
  range?: string;
  onRangeChange?: (range: string) => void;
  /** Extra header control (e.g. a MoreMenu), after the range toggle. */
  action?: ReactNode;
  /** Footer content under the chart. */
  footer?: ReactNode;
  /** Heading level of the title, to fit the page outline (default h3). */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

const DEFAULT_CATEGORIES = ['Compute', 'Storage', 'Network'] as const;
const DEFAULT_COLORS: readonly ChartColor[] = ['primary', 'violet', 'cyan'];

/**
 * Chart in a Card: title, optional headline value + delta, a 7d/30d/90d range ToggleGroup, and an
 * @gntik-ai/charts area, line, bar or heatmap chart with its legend (heatmap: its colour scale).
 * The chart states (`state`, `emptyMessage`, `errorMessage`, `onRetry`) and `dataTable` pass through.
 */
export function ChartCard<T extends object = CostPoint>({
  title = 'Infrastructure cost',
  description = 'Spend by resource',
  ranges = COST_RANGES,
  dataByRange = COST_BY_RANGE as unknown as Readonly<Record<string, readonly T[]>>,
  index = 'day' as Extract<keyof T, string>,
  categories = DEFAULT_CATEGORIES as unknown as ReadonlyArray<Extract<keyof T, string>>,
  kind = 'area',
  heatmap,
  stacked = true,
  colors = DEFAULT_COLORS,
  valueFormatter = chartFmt.usd,
  showLegend = true,
  height = 240,
  defaultRange,
  range: rangeProp,
  onRangeChange,
  action,
  footer,
  titleAs = 'h3',
  className,
  state,
  emptyMessage,
  errorMessage,
  onRetry,
  dataTable,
}: ChartCardProps<T>) {
  const [inner, setInner] = useState(defaultRange ?? ranges[0]?.value ?? '');
  const current = rangeProp ?? inner;
  const active = ranges.find((r) => r.value === current) ?? ranges[0];
  const data = (active && dataByRange[active.value]) ?? [];
  const chartLabel = `${title}${active ? `, ${active.label}` : ''}`;
  const states = { state, emptyMessage, errorMessage, onRetry, dataTable };
  const common = { data, index, categories, colors, valueFormatter, showLegend, height, 'aria-label': chartLabel, ...states };
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle as={titleAs}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction className="flex items-center gap-2">
          {ranges.length > 1 && (
            <ToggleGroup
              aria-label={`${title} range`}
              size="sm"
              value={[current]}
              onValueChange={(v) => {
                const next = v[0];
                if (!next) return;
                setInner(next);
                onRangeChange?.(next);
              }}
            >
              {ranges.map((r) => (
                <Toggle key={r.value} value={r.value} className="font-mono">
                  {r.label}
                </Toggle>
              ))}
            </ToggleGroup>
          )}
          {action}
        </CardAction>
      </CardHeader>
      {active?.summary && (
        <p className="flex flex-wrap items-baseline gap-x-2 px-5" aria-live="polite">
          <span className="text-[24px] font-semibold tracking-tight text-foreground tabular-nums">{active.summary.value}</span>
          {active.summary.delta && <TrendDelta {...active.summary.delta} />}
        </p>
      )}
      <div className={cn('px-3 pb-4 pt-3 sm:px-4', !footer && 'pb-5')}>
        {kind === 'heatmap' ? (
          <Heatmap
            data={data}
            index={index}
            categories={categories}
            color={colors[0] ?? 'primary'}
            valueFormatter={valueFormatter}
            showScale={showLegend}
            height={height}
            aria-label={chartLabel}
            {...heatmap}
            {...states}
            dataTable={dataTable ?? true}
          />
        ) : kind === 'bar' ? (
          <BarChart {...common} stacked={stacked} />
        ) : kind === 'line' ? (
          <LineChart {...common} />
        ) : (
          <AreaChart {...common} stacked={stacked} />
        )}
      </div>
      {footer && <div className="border-t border-border px-5 py-3 text-[12.5px] text-muted-foreground">{footer}</div>}
    </Card>
  );
}
