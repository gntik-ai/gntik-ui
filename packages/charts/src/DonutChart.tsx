import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useHiddenSeries, legendFocus } from './ChartLegend';
import { tooltipContent } from './ChartTooltip';
import { cx, identity, type ValueFormatter } from './format';
import { accessibleName, field, numField, type DataKey } from './shared';
import { CHART_COLORS, seriesColor, useChartTheme, type ChartColor } from './theme';

export interface DonutChartProps<T extends object> {
  data: readonly T[];
  /** Key of the slice name field. */
  index: DataKey<T>;
  /** Key of the slice value field. */
  category: DataKey<T>;
  colors?: readonly ChartColor[];
  valueFormatter?: ValueFormatter;
  variant?: 'donut' | 'pie';
  showLegend?: boolean;
  /** Caption under the total in the donut hole (donut variant only). */
  centerLabel?: string;
  /** Diameter in px. */
  height?: number;
  'aria-label'?: string;
  title?: string;
  description?: string;
  className?: string;
}

interface Slice {
  name: string;
  value: number;
  fill: string;
}

/** Donut / pie with a clickable value legend; hidden slices drop out of the total. */
export function DonutChart<T extends object>({
  data,
  index,
  category,
  colors = CHART_COLORS,
  valueFormatter = identity,
  variant = 'donut',
  showLegend = true,
  centerLabel,
  height = 264,
  title,
  description,
  className,
  'aria-label': ariaLabel,
}: DonutChartProps<T>) {
  const t = useChartTheme();
  const [hidden, toggle] = useHiddenSeries();
  // Per-slice `fill` on the datum replaces the deprecated <Cell> of Recharts 2.
  const slices: Slice[] = data.map((d, i) => ({
    name: String(field(d, index)),
    value: numField(d, category),
    fill: seriesColor(t, colors, i),
  }));
  const shown = slices.filter((s) => !hidden.has(s.name));
  const total = shown.reduce((sum, s) => sum + s.value, 0);
  const isDonut = variant === 'donut';
  const name = accessibleName(
    isDonut ? 'Donut chart' : 'Pie chart',
    ariaLabel,
    title,
    slices.map((s) => s.name),
  );
  return (
    <div role="figure" aria-label={name} className={cx('flex flex-col items-center gap-6 font-sans sm:flex-row', className)}>
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer title={title} desc={description}>
            <Pie
              data={shown}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={isDonut ? '64%' : 0}
              outerRadius="94%"
              paddingAngle={shown.length > 1 ? 1.5 : 0}
              stroke={t.surface}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Tooltip isAnimationActive={false} content={tooltipContent({ valueFormatter })} />
          </PieChart>
        </ResponsiveContainer>
        {isDonut && centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-[20px] font-semibold tabular-nums text-foreground">{valueFormatter(total)}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{centerLabel}</div>
          </div>
        )}
      </div>
      {showLegend && (
        <div className="flex w-full min-w-0 flex-1 flex-col gap-2">
          {slices.map((s) => {
            const off = hidden.has(s.name);
            return (
              <button
                key={s.name}
                type="button"
                aria-pressed={!off}
                onClick={() => toggle(s.name)}
                className={cx('group flex items-center justify-between gap-3', off && 'opacity-40', legendFocus)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className={cx('h-2.5 w-2.5 shrink-0 rounded-[3px]', off && 'grayscale')}
                    style={{ background: s.fill }}
                  />
                  <span
                    className={cx(
                      'truncate text-[12.5px] text-muted-foreground',
                      off ? 'line-through' : 'transition-colors group-hover:text-foreground',
                    )}
                  >
                    {s.name}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[12px] font-medium tabular-nums text-foreground">
                  {valueFormatter(s.value)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
