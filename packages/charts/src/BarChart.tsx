import { Bar, BarChart as RBarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, useHiddenSeries } from './ChartLegend';
import { tooltipContent } from './ChartTooltip';
import { formatAny, identity } from './format';
import { accessibleName, cartesianTable, axisProps, CHART_MARGIN, ChartFrame, type BaseChartProps, type DataKey } from './shared';
import { resolveState } from './states';
import { CHART_COLORS, seriesColor, useChartTheme } from './theme';

export interface BarChartProps<T extends object> extends BaseChartProps<T> {
  categories: ReadonlyArray<DataKey<T>>;
  stacked?: boolean;
  /** "horizontal" = vertical bars (categories on X); "vertical" = horizontal bars (categories on Y). */
  layout?: 'horizontal' | 'vertical';
  showYAxis?: boolean;
}

type Radius = number | [number, number, number, number];

/** Bar chart: vertical, horizontal or stacked; flat fills, no animation. */
export function BarChart<T extends object>({
  data,
  index,
  categories,
  colors = CHART_COLORS,
  valueFormatter = identity,
  stacked = false,
  layout = 'horizontal',
  showLegend = true,
  showGrid = true,
  showYAxis = true,
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
}: BarChartProps<T>) {
  const t = useChartTheme();
  const [hidden, toggle] = useHiddenSeries();
  const col = (i: number) => seriesColor(t, colors, i);
  const legend = categories.map((c, i) => ({ key: c, label: c, color: col(i) }));
  const vertical = layout === 'vertical';
  const radius: Radius = stacked ? 0 : vertical ? [0, 3, 3, 0] : [3, 3, 0, 0];
  const name = accessibleName('Bar chart', ariaLabel, title, categories);
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
      legend={
        showLegend &&
        categories.length > 1 && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />
      }
    >
      <RBarChart
        data={data}
        layout={layout}
        margin={CHART_MARGIN}
        barCategoryGap={vertical ? '22%' : '28%'}
        accessibilityLayer
        title={title}
        desc={description}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={vertical} horizontal={!vertical} />}
        {vertical ? (
          <>
            <XAxis type="number" {...axisProps(t)} tickFormatter={valueFormatter} />
            <YAxis type="category" dataKey={index} {...axisProps(t)} width={92} />
          </>
        ) : (
          <>
            <XAxis dataKey={index} {...axisProps(t)} dy={8} minTickGap={16} />
            {showYAxis && <YAxis {...axisProps(t)} width={50} tickFormatter={valueFormatter} />}
          </>
        )}
        <Tooltip
          isAnimationActive={false}
          cursor={{ fill: t.barCursor }}
          content={tooltipContent({ valueFormatter })}
        />
        {categories.map((c, i) => (
          <Bar
            key={c}
            dataKey={c}
            name={c}
            hide={hidden.has(c)}
            stackId={stacked ? '1' : undefined}
            fill={col(i)}
            radius={radius}
            maxBarSize={vertical ? 22 : 46}
            isAnimationActive={false}
          />
        ))}
      </RBarChart>
    </ChartFrame>
  );
}
