import { useState } from 'react';
import { Badge, Button, Card, Toggle, ToggleGroup, cn, type BadgeTone } from '@gntik-ai/ui';
import { Check, Sparkles } from '@gntik-ai/icons';
import { formatDate, formatMoney, type DateInput } from '../format';
import { samplePlan } from './fixtures';

export type PlanStatus = 'active' | 'trialing' | 'past_due' | 'canceled';
export type BillingCycle = 'monthly' | 'annual';

export interface BillingPlan {
  name: string;
  status?: PlanStatus;
  /** Price per month on the monthly cycle. */
  priceMonthly: number;
  /** Price per month when billed annually. Enables the monthly/annual toggle. */
  priceAnnual?: number;
  /** ISO 4217 code. Default USD. */
  currency?: string;
  /** Next renewal date. */
  renewsOn: DateInput;
  /** Short line after the renewal date, e.g. "50 seats · 2 regions". */
  summary?: string;
  features?: string[];
}

export interface PlanCardProps {
  plan?: BillingPlan;
  /** Initial cycle shown (uncontrolled). */
  defaultCycle?: BillingCycle;
  onCycleChange?: (cycle: BillingCycle) => void;
  onUpgrade?: () => void;
  onManage?: () => void;
  upgradeLabel?: string;
  manageLabel?: string;
  className?: string;
}

const STATUS: Record<PlanStatus, { label: string; tone: BadgeTone }> = {
  active: { label: 'Active', tone: 'success' },
  trialing: { label: 'Trial', tone: 'info' },
  past_due: { label: 'Past due', tone: 'warning' },
  canceled: { label: 'Canceled', tone: 'neutral' },
};

/** Billing page header: the current plan, its price per cycle, renewal date, features and actions. */
export function PlanCard({
  plan = samplePlan,
  defaultCycle = 'monthly',
  onCycleChange,
  onUpgrade,
  onManage,
  upgradeLabel = 'Upgrade plan',
  manageLabel = 'Manage',
  className,
}: PlanCardProps) {
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);
  const hasAnnual = plan.priceAnnual != null;
  const annual = hasAnnual && cycle === 'annual';
  const perMonth = annual ? (plan.priceAnnual ?? plan.priceMonthly) : plan.priceMonthly;
  const currency = plan.currency ?? 'USD';
  const savings = hasAnnual ? Math.round((1 - (plan.priceAnnual ?? 0) / plan.priceMonthly) * 100) : 0;
  const status = STATUS[plan.status ?? 'active'];

  const changeCycle = (value: string[]) => {
    const next = value[0];
    if (next !== 'monthly' && next !== 'annual') return;
    setCycle(next);
    onCycleChange?.(next);
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[17px] font-semibold tracking-tight text-foreground">{plan.name} plan</h3>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Renews {formatDate(plan.renewsOn)}
            {plan.summary && <> · {plan.summary}</>}
          </p>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="text-[30px] font-semibold tracking-tight text-foreground tabular-nums">
              {formatMoney(perMonth, currency, true)}
            </span>
            <span className="text-[13px] text-muted-foreground">/ month</span>
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {annual ? `Billed annually (${formatMoney(perMonth * 12, currency, true)})` : 'Billed monthly'}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          {hasAnnual && (
            <ToggleGroup size="sm" aria-label="Billing cycle" value={[cycle]} onValueChange={changeCycle}>
              <Toggle value="monthly">Monthly</Toggle>
              <Toggle value="annual">Annual{savings > 0 && ` −${savings}%`}</Toggle>
            </ToggleGroup>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={onManage}>
              {manageLabel}
            </Button>
            <Button icon={Sparkles} onClick={onUpgrade}>
              {upgradeLabel}
            </Button>
          </div>
        </div>
      </div>
      {plan.features && plan.features.length > 0 && (
        <ul aria-label={`${plan.name} plan features`} className="mt-5 grid gap-x-6 gap-y-2 border-t border-border pt-5 sm:grid-cols-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-foreground">
              <Check size={15} aria-hidden className="mt-0.5 shrink-0 text-primary-text" />
              {f}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
