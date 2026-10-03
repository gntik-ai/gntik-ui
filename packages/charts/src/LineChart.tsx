import { CartesianGrid, Line, LineChart as RLineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, useHiddenSeries } from './ChartLegend';
import { tooltipContent } from './ChartTooltip';
import { identity } from './format';
import { accessibleName, axisProps, CHART_MARGIN, ChartFrame, field, type BaseChartProps, type DataKey } from './shared';
import { CHART_COLORS, seriesColor, useChartTheme } from './theme';

export interface LineChartProps<T extends object> extends BaseChartProps<T> {
  categories: ReadonlyArray<DataKey<T>>;
  showYAxis?: boolean;
  /** Only label the first and last x ticks. */
  startEndOnly?: boolean;
  curve?: 'monotone' | 'linear' | 'step' | 'natural';
}

type Tick = string | number;
const asTick = (v: unknown): Tick => (typeof v === 'number' ? v : String(v));

/** Line chart: 2px strokes, no dots until hover, no animation. */
export function LineChart<T extends object>({
  data,
  index,
  categories,
  colors = CHART_COLORS,
  valueFormatter = identity,
  showLegend = true,
  showGrid = true,
  showYAxis = true,
  startEndOnly = false,
  curve = 'monotone',
  height = 288,
  title,
  description,
  className,
  'aria-label': ariaLabel,
}: LineChartProps<T>) {
  const t = useChartTheme();
  const [hidden, toggle] = useHiddenSeries();
  const col = (i: number) => seriesColor(t, colors, i);
  const legend = categories.map((c, i) => ({ key: c, label: c, color: col(i) }));
  const first = data[0];
  const last = data[data.length - 1];
  const xTicks: Tick[] | undefined =
    startEndOnly && first && last ? [asTick(field(first, index)), asTick(field(last, index))] : undefined;
  const name = accessibleName('Line chart', ariaLabel, title, categories);
  return (
    <ChartFrame
      label={name}
      height={height}
      className={className}
      legend={showLegend && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
    >
      <RLineChart data={data} margin={CHART_MARGIN} accessibilityLayer title={title} desc={description}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />}
        <XAxis
          dataKey={index}
          {...axisProps(t)}
          dy={8}
          minTickGap={startEndOnly ? 0 : 20}
          ticks={xTicks}
          interval={startEndOnly ? 'preserveStartEnd' : undefined}
        />
        {showYAxis && <YAxis {...axisProps(t)} width={50} tickFormatter={valueFormatter} />}
        <Tooltip
          isAnimationActive={false}
          cursor={{ stroke: t.cursor, strokeWidth: 1 }}
          content={tooltipContent({ valueFormatter })}
        />
        {categories.map((c, i) => (
          <Line
            key={c}
            type={curve}
            dataKey={c}
            name={c}
            hide={hidden.has(c)}
            stroke={col(i)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        ))}
      </RLineChart>
    </ChartFrame>
  );
}
