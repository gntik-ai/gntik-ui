import { Area, AreaChart as RAreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, useHiddenSeries } from './ChartLegend';
import { tooltipContent } from './ChartTooltip';
import { formatAny, identity } from './format';
import { accessibleName, cartesianTable, axisProps, CHART_MARGIN, ChartFrame, type BaseChartProps, type DataKey } from './shared';
import { resolveState } from './states';
import { useCartesianExtras, type CartesianExtrasProps } from './cartesian-extras';
import { CHART_COLORS, seriesColor, useChartTheme } from './theme';

export interface AreaChartProps<T extends object> extends CartesianExtrasProps, BaseChartProps<T> {
  categories: ReadonlyArray<DataKey<T>>;
  stacked?: boolean;
  showYAxis?: boolean;
  curve?: 'monotone' | 'linear' | 'step' | 'natural';
}

/** Area chart: flat fills (no gradient), no entry animation, interactive legend. */
export function AreaChart<T extends object>({
  data,
  index,
  categories,
  colors = CHART_COLORS,
  valueFormatter = identity,
  stacked = false,
  showLegend = true,
  showGrid = true,
  showYAxis = true,
  curve = 'monotone',
  height = 288,
  title,
  description,
  className,
  'aria-label': ariaLabel,
  state,
  emptyMessage,
  errorMessage,
  onRetry,
  dataTable = false,
  thresholds,
  annotations,
  brush,
  range,
  defaultRange,
  onRangeChange,
  animate,
}: AreaChartProps<T>) {
  const t = useChartTheme();
  const [hidden, toggle] = useHiddenSeries();
  const x = useCartesianExtras(data, index, { thresholds, annotations, brush, range, defaultRange, onRangeChange, animate }, { valueFormatter, previewKey: categories[0] });
  const col = (i: number) => seriesColor(t, colors, i);
  const legend = categories.map((c, i) => ({ key: c, label: c, color: col(i) }));
  const name = accessibleName('Area chart', ariaLabel, title, categories);
  return (
    <ChartFrame
      label={name}
      state={resolveState(state, data.length)}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      table={dataTable && cartesianTable(name, x.view, index, categories, (v) => formatAny(v, valueFormatter))}
      height={height}
      className={className}
      footer={x.footer}
      legend={showLegend && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
    >
      <RAreaChart data={x.view} margin={CHART_MARGIN} accessibilityLayer title={title} desc={description}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />}
        <XAxis dataKey={index} {...axisProps(t)} dy={8} minTickGap={20} />
        {showYAxis && <YAxis {...axisProps(t)} width={50} tickFormatter={valueFormatter} />}
        {x.references}
        <Tooltip
          isAnimationActive={false}
          cursor={{ stroke: t.cursor, strokeWidth: 1 }}
          content={tooltipContent({ valueFormatter })}
        />
        {categories.map((c, i) => (
          <Area
            key={c}
            type={curve}
            dataKey={c}
            name={c}
            hide={hidden.has(c)}
            stackId={stacked ? '1' : undefined}
            stroke={col(i)}
            strokeWidth={2}
            fill={col(i)}
            fillOpacity={stacked ? 0.82 : 0.14}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0 }}
            {...x.animation}
          />
        ))}
      </RAreaChart>
    </ChartFrame>
  );
}
