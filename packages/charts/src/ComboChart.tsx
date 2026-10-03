import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, useHiddenSeries } from './ChartLegend';
import { tooltipContent } from './ChartTooltip';
import { formatAny, identity, type ValueFormatter } from './format';
import { accessibleName, cartesianTable, axisProps, ChartFrame, type BaseChartProps, type DataKey } from './shared';
import { resolveState } from './states';
import { useCartesianExtras, type CartesianExtrasProps } from './cartesian-extras';
import { useChartTheme, type ChartColor } from './theme';

export interface ComboChartProps<T extends object>
  extends CartesianExtrasProps, Omit<BaseChartProps<T>, 'colors' | 'valueFormatter'> {
  /** Series drawn as bars on the left axis. */
  barSeries: DataKey<T>;
  /** Series drawn as a line on the right axis. */
  lineSeries: DataKey<T>;
  barColor?: ChartColor;
  lineColor?: ChartColor;
  barFormatter?: ValueFormatter;
  lineFormatter?: ValueFormatter;
}

/** Combo chart: bars on the left axis, a line on the right axis. */
export function ComboChart<T extends object>({
  data,
  index,
  barSeries,
  lineSeries,
  barColor = 'primary',
  lineColor = 'amber',
  barFormatter = identity,
  lineFormatter = identity,
  showLegend = true,
  showGrid = true,
  height = 300,
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
}: ComboChartProps<T>) {
  const t = useChartTheme();
  const [hidden, toggle] = useHiddenSeries();
  const x = useCartesianExtras(data, index, { thresholds, annotations, brush, range, defaultRange, onRangeChange, animate }, { valueFormatter: barFormatter, previewKey: barSeries, yAxisIdOf: (axis) => axis });
  const bc = t.color(barColor);
  const lc = t.color(lineColor);
  const legend = [
    { key: barSeries, label: barSeries, color: bc },
    { key: lineSeries, label: lineSeries, color: lc },
  ];
  const fmtSeries = (v: unknown, name: string) => formatAny(v, name === lineSeries ? lineFormatter : barFormatter);
  const name = accessibleName('Combo chart', ariaLabel, title, [barSeries, lineSeries]);
  return (
    <ChartFrame
      label={name}
      state={resolveState(state, data.length)}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      table={dataTable && cartesianTable(name, x.view, index, [barSeries, lineSeries], fmtSeries)}
      height={height}
      className={className}
      footer={x.footer}
      legend={showLegend && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
    >
      <ComposedChart
        data={x.view}
        margin={{ top: 6, right: 6, left: 0, bottom: 0 }}
        barCategoryGap="30%"
        accessibilityLayer
        title={title}
        desc={description}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />}
        <XAxis dataKey={index} {...axisProps(t)} dy={8} minTickGap={16} />
        <YAxis yAxisId="left" {...axisProps(t)} width={48} tickFormatter={barFormatter} />
        <YAxis yAxisId="right" orientation="right" {...axisProps(t)} width={48} tickFormatter={lineFormatter} />
        {x.references}
        <Tooltip
          isAnimationActive={false}
          cursor={{ fill: t.barCursor }}
          content={tooltipContent({ seriesFormatter: fmtSeries })}
        />
        <Bar
          yAxisId="left"
          dataKey={barSeries}
          name={barSeries}
          hide={hidden.has(barSeries)}
          fill={bc}
          radius={[3, 3, 0, 0]}
          maxBarSize={42}
          {...x.animation}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey={lineSeries}
          name={lineSeries}
          hide={hidden.has(lineSeries)}
          stroke={lc}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3.5, strokeWidth: 0 }}
          {...x.animation}
        />
      </ComposedChart>
    </ChartFrame>
  );
}
