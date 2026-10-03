import { Card, cn } from '@gntik-ai/ui';
import { CHART_COLORS, DonutChart, type ChartColor } from '@gntik-ai/charts';
import { formatMoney } from '../format';
import { sampleCosts } from './fixtures';

export interface CostItem {
  label: string;
  amount: number;
}

export interface CostBreakdownProps {
  items?: CostItem[];
  currency?: string;
  title?: string;
  /** Caption under the total in the donut hole. */
  centerLabel?: string;
  /** Donut diameter in px. */
  size?: number;
  /** Heading level of the title, to fit the page outline (default h3). */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

/** Swatch classes matching the chart series tokens (categorical accents, never severity). */
const SWATCH: Record<ChartColor, string> = {
  primary: 'bg-primary',
  emerald: 'bg-brand-accent',
  violet: 'bg-category-violet',
  cyan: 'bg-category-cyan',
  amber: 'bg-category-amber',
  rose: 'bg-category-rose',
  info: 'bg-info',
};

/** Where the spend goes: a donut by category plus the categories ranked by amount. */
export function CostBreakdown({
  items = sampleCosts,
  currency = 'USD',
  title = 'Cost breakdown',
  centerLabel = 'this cycle',
  size = 176,
  titleAs: TitleTag = 'h3',
  className,
}: CostBreakdownProps) {
  const ranked = [...items].sort((a, b) => b.amount - a.amount);
  const total = ranked.reduce((sum, i) => sum + i.amount, 0);
  const money = (n: number) => formatMoney(n, currency);
  const colorAt = (i: number): ChartColor => CHART_COLORS[i % CHART_COLORS.length] ?? 'primary';

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <TitleTag className="text-[15px] font-semibold tracking-tight text-foreground">{title}</TitleTag>
        <span className="font-mono text-[13px] font-semibold text-foreground tabular-nums">{money(total)}</span>
      </div>
      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <DonutChart
          data={ranked}
          index="label"
          category="amount"
          showLegend={false}
          centerLabel={centerLabel}
          valueFormatter={(n) => formatMoney(n, currency, true)}
          height={size}
          aria-label={`${title}: ${ranked.map((i) => `${i.label} ${money(i.amount)}`).join(', ')}`}
          className="shrink-0"
        />
        <ol aria-label="Categories by cost" className="grid w-full min-w-0 flex-1 gap-3">
          {ranked.map((item, i) => {
            const pct = total > 0 ? (item.amount / total) * 100 : 0;
            return (
              <li key={item.label} className="grid gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-[13px] text-foreground">
                    <span aria-hidden className="w-4 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <span aria-hidden className={cn('size-2.5 shrink-0 rounded-[3px]', SWATCH[colorAt(i)])} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[12.5px] whitespace-nowrap text-muted-foreground tabular-nums">
                    <span className="font-semibold text-foreground">{money(item.amount)}</span> · {pct.toFixed(1)}%
                  </span>
                </div>
                <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className={cn('h-full rounded-full', SWATCH[colorAt(i)])} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
}
