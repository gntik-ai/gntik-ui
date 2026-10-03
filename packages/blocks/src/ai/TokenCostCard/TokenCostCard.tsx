import { useState } from 'react';
import {
  Card,
  CardAction,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Meter,
  Toggle,
  ToggleGroup,
  cn,
} from '@gntik-ai/ui';
import { tokenUsagePeriods, type TokenUsagePeriod } from './fixtures';

export type { TokenUsagePeriod } from './fixtures';

export interface TokenCostCardProps {
  /** One entry per selectable period (a single entry hides the switch). */
  periods?: TokenUsagePeriod[];
  defaultPeriod?: string;
  /** ISO 4217 currency code for cost and budget. */
  currency?: string;
  title?: string;
  /** Subtitle, e.g. the model or project the usage belongs to. */
  description?: string;
  /** Heading level of the title, to fit the page outline (default h3). */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en-US');

/** Token usage and spend for a period, with a budget meter. */
export function TokenCostCard({
  periods = tokenUsagePeriods,
  defaultPeriod,
  currency = 'USD',
  title = 'Token usage',
  description = 'All models · current project',
  titleAs = 'h3',
  className,
}: TokenCostCardProps) {
  const [periodId, setPeriodId] = useState(defaultPeriod ?? periods[1]?.id ?? periods[0]?.id ?? '');
  const period = periods.find((p) => p.id === periodId) ?? periods[0];
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  if (!period) return null;

  const totalTokens = period.inputTokens + period.outputTokens;
  const inputShare = totalTokens > 0 ? (period.inputTokens / totalTokens) * 100 : 0;
  const remaining = period.budget - period.cost;

  const stats = [
    { label: 'Input tokens', value: period.inputTokens, swatch: 'bg-primary' },
    { label: 'Output tokens', value: period.outputTokens, swatch: 'bg-category-violet' },
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div>
          <CardTitle as={titleAs}>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {periods.length > 1 && (
          <CardAction>
            <ToggleGroup aria-label="Period" size="sm" value={[period.id]} onValueChange={(v) => v[0] && setPeriodId(v[0])}>
              {periods.map((p) => (
                <Toggle key={p.id} value={p.id}>
                  {p.label}
                </Toggle>
              ))}
            </ToggleGroup>
          </CardAction>
        )}
      </CardHeader>
      <CardBody className="flex flex-col gap-5">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <span aria-hidden className={cn('size-2 rounded-sm', s.swatch)} />
                {s.label}
              </dt>
              <dd className="mt-1 font-mono text-[20px] font-semibold tracking-tight text-foreground" title={full.format(s.value)}>
                {compact.format(s.value)}
              </dd>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-[12px] text-muted-foreground">Cost</dt>
            <dd className="mt-1 font-mono text-[20px] font-semibold tracking-tight text-foreground">{money.format(period.cost)}</dd>
          </div>
        </dl>
        <div>
          <div aria-hidden className="flex h-2 overflow-hidden rounded-full bg-secondary">
            <span className="bg-primary" style={{ width: `${inputShare}%` }} />
            <span className="flex-1 bg-category-violet" />
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
            {Math.round(inputShare)}% input · {100 - Math.round(inputShare)}% output · {full.format(totalTokens)} tokens
          </p>
        </div>
        <Meter
          label="Budget"
          value={period.cost}
          max={period.budget}
          valueLabel={`${money.format(period.cost)} of ${money.format(period.budget)}`}
          aria-valuetext={`${money.format(period.cost)} of ${money.format(period.budget)}`}
          note={remaining >= 0 ? `${money.format(remaining)} left in this period` : `${money.format(-remaining)} over budget`}
        />
      </CardBody>
    </Card>
  );
}
