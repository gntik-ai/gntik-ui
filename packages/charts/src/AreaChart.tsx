import { Area, AreaChart as RAreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, useHiddenSeries } from './ChartLegend';
import { tooltipContent } from './ChartTooltip';
import { identity } from './format';
import { accessibleName, axisProps, CHART_MARGIN, ChartFrame, type BaseChartProps, type DataKey } from './shared';
import { CHART_COLORS, seriesColor, useChartTheme } from './theme';

export interface AreaChartProps<T extends object> extends BaseChartProps<T> {
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
}: AreaChartProps<T>) {
  const t = useChartTheme();
  const [hidden, toggle] = useHiddenSeries();
  const col = (i: number) => seriesColor(t, colors, i);
  const legend = categories.map((c, i) => ({ key: c, label: c, color: col(i) }));
  const name = accessibleName('Area chart', ariaLabel, title, categories);
  return (
    <ChartFrame
      label={name}
      height={height}
      className={className}
      legend={showLegend && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
    >
      <RAreaChart data={data} margin={CHART_MARGIN} accessibilityLayer title={title} desc={description}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />}
        <XAxis dataKey={index} {...axisProps(t)} dy={8} minTickGap={20} />
        {showYAxis && <YAxis {...axisProps(t)} width={50} tickFormatter={valueFormatter} />}
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
            isAnimationActive={false}
          />
        ))}
      </RAreaChart>
    </ChartFrame>
  );
}
