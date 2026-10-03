import { Badge, Card, cn } from '@gntik-ai/ui';
import { LineChart } from '@gntik-ai/charts';
import { formatMoney } from '../format';
import { sampleBudget, sampleSpend } from './fixtures';

export interface SpendPoint {
  /** X-axis label, e.g. "May 12". */
  label: string;
  /** Cumulative actual spend; null after today. */
  spend: number | null;
  /** Cumulative forecast; null before today. Start it on the last actual point to join the lines. */
  forecast?: number | null;
}

export interface SpendVsBudgetProps {
  data?: SpendPoint[];
  /** Budget cap for the period (drawn as a flat line). */
  budget?: number;
  currency?: string;
  title?: string;
  /** Period caption, e.g. "May cycle". */
  period?: string;
  /** Chart plot height in px. */
  height?: number;
  className?: string;
}

interface ChartRow {
  day: string;
  Spend: number | null;
  Forecast: number | null;
  Budget: number;
}

function lastValue(values: Array<number | null | undefined>): number | undefined {
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i];
    if (v != null) return v;
  }
  return undefined;
}

/** Cumulative spend against a budget cap, with the end-of-period forecast. */
export function SpendVsBudget({
  data = sampleSpend,
  budget = sampleBudget,
  currency = 'USD',
  title = 'Spend vs budget',
  period = 'May cycle',
  height = 240,
  className,
}: SpendVsBudgetProps) {
  const toDate = lastValue(data.map((d) => d.spend)) ?? 0;
  const forecast = lastValue(data.map((d) => d.forecast)) ?? toDate;
  const over = forecast > budget;
  const rows: ChartRow[] = data.map((d) => ({ day: d.label, Spend: d.spend, Forecast: d.forecast ?? null, Budget: budget }));
  const money = (n: number) => formatMoney(n, currency, true);
  const stats = [
    { label: 'Spend to date', value: formatMoney(toDate, currency) },
    { label: 'Forecast', value: formatMoney(forecast, currency) },
    { label: 'Budget', value: formatMoney(budget, currency) },
  ];

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
          {period && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{period}</p>}
        </div>
        <Badge tone={over ? 'warning' : 'success'} dot>
          {over ? 'Forecast over budget' : 'Within budget'}
        </Badge>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <dt className="text-[11.5px] text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 truncate font-mono text-[14px] font-semibold text-foreground tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
      <LineChart
        className="mt-5"
        data={rows}
        index="day"
        categories={['Spend', 'Forecast', 'Budget']}
        colors={['primary', 'cyan', 'amber']}
        valueFormatter={money}
        height={height}
        aria-label={`${title}: ${formatMoney(toDate, currency)} spent, ${formatMoney(forecast, currency)} forecast against a ${formatMoney(budget, currency)} budget`}
      />
    </Card>
  );
}
