import { Funnel, FunnelChart as RFunnelChart, ResponsiveContainer, Tooltip } from 'recharts';
import { tooltipContent } from './ChartTooltip';
import { chartFmt, cx, identity, type ValueFormatter } from './format';
import { sequentialRamp } from './palette';
import { accessibleName, field, numField, type DataKey } from './shared';
import { ChartDataTable, chartStateView, resolveState, type ChartStateProps } from './states';
import { useChartTheme, type ChartColor } from './theme';

export interface FunnelChartProps<T extends object> extends ChartStateProps {
  /** Stages in order, widest first. */
  data: readonly T[];
  /** Key of the stage name. */
  index: DataKey<T>;
  /** Key of the stage count. */
  category: DataKey<T>;
  /** Hue of the stages (a sequential ramp, strongest first). Default `primary`. */
  color?: ChartColor;
  valueFormatter?: ValueFormatter;
  /** Show the stage list with conversion and drop-off. Default `true`. */
  showStages?: boolean;
  /** Funnel height in px. */
  height?: number;
  'aria-label'?: string;
  title?: string;
  description?: string;
  className?: string;
}

export interface FunnelStage {
  name: string;
  value: number;
  /** Share of the first stage (0–1). */
  conversion: number;
  /** Loss from the previous stage (0–1); 0 for the first stage. */
  dropOff: number;
  fill: string;
}

/** Stage maths: conversion against the first stage and drop-off against the previous one. */
export function funnelStages(
  values: ReadonlyArray<{ name: string; value: number }>,
  fills: readonly string[] = [],
): FunnelStage[] {
  const first = values[0]?.value ?? 0;
  return values.map((s, i) => {
    const prev = i === 0 ? s.value : (values[i - 1]?.value ?? 0);
    return {
      name: s.name,
      value: s.value,
      conversion: first > 0 ? s.value / first : 0,
      dropOff: i === 0 || prev <= 0 ? 0 : Math.max(0, (prev - s.value) / prev),
      fill: fills[i] ?? fills[fills.length - 1] ?? 'hsl(var(--primary))',
    };
  });
}

/** Staged conversion funnel: trapezoids in a one-hue ramp plus a stage list with drop-off. */
export function FunnelChart<T extends object>({
  data,
  index,
  category,
  color = 'primary',
  valueFormatter = identity,
  showStages = true,
  height = 260,
  title,
  description,
  className,
  'aria-label': ariaLabel,
  state,
  emptyMessage,
  errorMessage,
  onRetry,
  dataTable = false,
}: FunnelChartProps<T>) {
  const t = useChartTheme();
  const ramp = sequentialRamp(Math.max(data.length, 1), {
    color,
    min: 0.35,
  }).reverse();
  const stages = funnelStages(
    data.map((d) => ({
      name: String(field(d, index)),
      value: numField(d, category),
    })),
    ramp,
  );
  const name = accessibleName(
    'Funnel chart',
    ariaLabel,
    title,
    stages.map((s) => s.name),
  );
  const effective = resolveState(state, data.length);
  const placeholder = chartStateView(effective, {
    height,
    emptyMessage,
    errorMessage,
    onRetry,
  });
  const byName = new Map(stages.map((s) => [s.name, s]));
  const fmtStage = (v: unknown, stage: string) => {
    const s = byName.get(stage);
    const base = typeof v === 'number' ? valueFormatter(v) : String(v ?? '');
    return s ? `${base} · ${chartFmt.percent(s.conversion)}` : base;
  };
  return (
    <div
      role="figure"
      aria-label={name}
      aria-busy={effective === 'loading' || undefined}
      className={cx('w-full font-sans', className)}
    >
      {placeholder ?? (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <RFunnelChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }} accessibilityLayer title={title} desc={description}>
                <Funnel
                  data={stages}
                  dataKey="value"
                  nameKey="name"
                  stroke={t.surface}
                  strokeWidth={2}
                  lastShapeType="rectangle"
                  isAnimationActive={false}
                />
                <Tooltip isAnimationActive={false} content={tooltipContent({ seriesFormatter: fmtStage })} />
              </RFunnelChart>
            </ResponsiveContainer>
          </div>
          {showStages && (
            <ol aria-label="Stages" className="flex w-full flex-col gap-2 sm:w-64">
              {stages.map((s, i) => (
                <li key={s.name} className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-b-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.fill }} />
                    <span className="truncate text-[12.5px] text-foreground">{s.name}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2 font-mono text-[12px] tabular-nums">
                    <span className="font-medium text-foreground">{valueFormatter(s.value)}</span>
                    <span className="text-muted-foreground">{chartFmt.percent(s.conversion)}</span>
                    {i > 0 && (
                      <span className="text-destructive-text">
                        <span className="sr-only">drop-off </span>−{chartFmt.percent(s.dropOff)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {dataTable && (
            <ChartDataTable
              caption={name}
              columns={['Stage', category, 'Conversion', 'Drop-off']}
              rows={stages.map((s) => [
                s.name,
                valueFormatter(s.value),
                chartFmt.percent(s.conversion),
                chartFmt.percent(s.dropOff),
              ])}
            />
          )}
        </div>
      )}
    </div>
  );
}
