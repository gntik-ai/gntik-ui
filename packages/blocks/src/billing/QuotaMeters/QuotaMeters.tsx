import { useState, type ReactNode } from 'react';
import { Meter, Toggle, ToggleGroup, cn, type MeterThresholds } from '@gntik-ai/ui';
import { formatQuantity } from '../format';
import { sampleQuotas } from './fixtures';

export interface Quota {
  id: string;
  label: string;
  used: number;
  limit: number;
  /** End-of-cycle projection. When any quota has one, a Current/Projected toggle appears. */
  projected?: number;
  /** Unit after the numbers, e.g. "requests" or "GB". */
  unit?: string;
  /** Helper line under the bar. Over the limit, a default overage note is shown. */
  note?: ReactNode;
}

export type QuotaScope = 'current' | 'projected';

export interface QuotaMetersProps {
  quotas?: Quota[];
  /** Heading above the meters. */
  title?: string;
  /** Percent-of-limit thresholds for amber and red (default 80 / 100). */
  thresholds?: MeterThresholds;
  /** Formats used/limit numbers. Default: grouped, compact above a million. */
  formatValue?: (value: number) => string;
  defaultScope?: QuotaScope;
  onScopeChange?: (scope: QuotaScope) => void;
  className?: string;
}

/** Plan quotas as meters: green with headroom, amber near the cap, red over it. */
export function QuotaMeters({
  quotas = sampleQuotas,
  title = 'Plan usage',
  thresholds,
  formatValue = formatQuantity,
  defaultScope = 'current',
  onScopeChange,
  className,
}: QuotaMetersProps) {
  const [scope, setScope] = useState<QuotaScope>(defaultScope);
  const canProject = quotas.some((q) => q.projected != null);
  const showProjected = canProject && scope === 'projected';

  const changeScope = (value: string[]) => {
    const next = value[0];
    if (next !== 'current' && next !== 'projected') return;
    setScope(next);
    onScopeChange?.(next);
  };

  return (
    <section aria-label={title} className={cn('grid gap-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[13px] font-medium text-muted-foreground">{title}</h3>
        {canProject && (
          <ToggleGroup size="sm" aria-label="Usage period" value={[scope]} onValueChange={changeScope}>
            <Toggle value="current">Current cycle</Toggle>
            <Toggle value="projected">Projected</Toggle>
          </ToggleGroup>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        {quotas.map((q) => {
          const value = showProjected ? (q.projected ?? q.used) : q.used;
          const unit = q.unit ? ` ${q.unit}` : '';
          const text = `${formatValue(value)} / ${formatValue(q.limit)}${unit}`;
          const over = value - q.limit;
          const note = q.note ?? (over > 0 ? `${formatValue(over)}${unit} over the plan limit` : undefined);
          return (
            <Meter
              key={q.id}
              label={q.label}
              value={value}
              max={q.limit}
              thresholds={thresholds}
              valueLabel={text}
              aria-valuetext={text}
              note={note}
            />
          );
        })}
      </div>
    </section>
  );
}
