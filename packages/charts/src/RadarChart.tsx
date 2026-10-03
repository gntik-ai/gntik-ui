import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RRadarChart, Tooltip } from 'recharts';
import { ChartLegend, useHiddenSeries } from './ChartLegend';
import { tooltipContent } from './ChartTooltip';
import { formatAny, identity } from './format';
import { SAFE_CHART_COLORS } from './palette';
import { accessibleName, cartesianTable, ChartFrame, type BaseChartProps, type DataKey } from './shared';
import { resolveState } from './states';
import { seriesColor, useChartTheme } from './theme';

export interface RadarChartProps<T extends object> extends Omit<BaseChartProps<T>, 'showGrid'> {
  /** One key per compared entity (a polygon each). `index` holds the axis names. */
  categories: ReadonlyArray<DataKey<T>>;
  /** Upper bound of the radial scale (e.g. 100 for scores). Default: data max. */
  max?: number;
  /** Show the concentric grid. Default `true`. */
  showGrid?: boolean;
  /** Show the radial scale ticks. Default `false`. */
  showRadiusAxis?: boolean;
}

/** Multi-axis scores: one translucent polygon per category over a polygonal grid. */
export function RadarChart<T extends object>({
  data,
  index,
  categories,
  colors = SAFE_CHART_COLORS,
  valueFormatter = identity,
  max,
  showLegend = true,
  showGrid = true,
  showRadiusAxis = false,
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
}: RadarChartProps<T>) {
  const t = useChartTheme();
  const [hidden, toggle] = useHiddenSeries();
  const col = (i: number) => seriesColor(t, colors, i);
  const legend = categories.map((c, i) => ({
    key: c,
    label: c,
    color: col(i),
  }));
  const name = accessibleName('Radar chart', ariaLabel, title, categories);
  return (
    <ChartFrame
      label={name}
      state={resolveState(state, data.length)}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      table={dataTable && cartesianTable(name, data, index, categories, (v) => formatAny(v, valueFormatter))}
      height={height}
      className={className}
      legend={showLegend && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
    >
      <RRadarChart data={data} outerRadius="76%" accessibilityLayer title={title} desc={description}>
        {showGrid && <PolarGrid stroke={t.grid} />}
        <PolarAngleAxis dataKey={index} tick={{ fill: t.text, fontSize: 11 }} />
        <PolarRadiusAxis
          domain={[0, max ?? 'auto']}
          angle={90}
          axisLine={false}
          tick={showRadiusAxis ? { fill: t.text, fontSize: 10 } : false}
          tickFormatter={valueFormatter}
        />
        <Tooltip isAnimationActive={false} content={tooltipContent({ valueFormatter })} />
        {categories.map((c, i) => (
          <Radar
            key={c}
            dataKey={c}
            name={c}
            hide={hidden.has(c)}
            stroke={col(i)}
            strokeWidth={2}
            fill={col(i)}
            fillOpacity={0.14}
            dot={{ r: 2.5, strokeWidth: 0, fill: col(i) }}
            isAnimationActive={false}
          />
        ))}
      </RRadarChart>
    </ChartFrame>
  );
}
