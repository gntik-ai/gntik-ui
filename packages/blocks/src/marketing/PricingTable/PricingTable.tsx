import { useId, useState, type ReactNode } from 'react';
import { Badge, Button, Toggle, ToggleGroup, cn } from '@gntik-ai/ui';
import { Check } from '@gntik-ai/icons';
import { samplePricingTiers } from './fixtures';

export type PricingCycle = 'monthly' | 'annual';

export interface PricingTier {
  id: string;
  name: string;
  description?: string;
  /** Price per month on monthly billing; null shows "Custom". */
  priceMonthly: number | null;
  /** Price per month on annual billing; null shows "Custom". */
  priceAnnual: number | null;
  /** Call-to-action label. */
  cta: string;
  features: string[];
  /** Emphasised with a primary border (no colour fill). */
  highlighted?: boolean;
  /** Label on the tier, e.g. "Most popular". */
  badge?: string;
}

export interface PricingTableProps {
  tiers?: PricingTier[];
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  currency?: string;
  defaultCycle?: PricingCycle;
  onCycleChange?: (cycle: PricingCycle) => void;
  /** Called with the tier and the cycle shown when a CTA is activated. */
  onSelectTier?: (tier: PricingTier, cycle: PricingCycle) => void;
  /** Note next to the annual option, e.g. "Save 20%". */
  annualNote?: string;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

const GRID = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' } as const;

/** Pricing section: tiers with a monthly/annual toggle, a highlighted tier and a feature checklist. */
export function PricingTable({
  tiers = samplePricingTiers,
  eyebrow = 'Pricing',
  title = 'Simple pricing that scales with you',
  description = 'Start free, upgrade when you need more. Every plan includes the core platform.',
  currency = 'USD',
  defaultCycle = 'monthly',
  onCycleChange,
  onSelectTier,
  annualNote = 'Save 20%',
  headingLevel: Heading = 'h2',
  className,
}: PricingTableProps) {
  const titleId = useId();
  const [cycle, setCycle] = useState<PricingCycle>(defaultCycle);
  const TierHeading = Heading === 'h2' ? 'h3' : 'h4';
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });

  const changeCycle = (value: string[]) => {
    const next = value[0];
    if (next !== 'monthly' && next !== 'annual') return;
    setCycle(next);
    onCycleChange?.(next);
  };

  return (
    <section aria-labelledby={titleId} className={cn('px-4 py-16 sm:px-6 sm:py-20', className)}>
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow && <p className="font-mono text-[12px] font-semibold tracking-wide text-primary-text uppercase">{eyebrow}</p>}
        <Heading id={titleId} className="mt-2 text-[28px] leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-[34px]">
          {title}
        </Heading>
        {description && <p className="mt-4 text-[15.5px] leading-relaxed text-pretty text-muted-foreground">{description}</p>}
      </div>
      <div className="mt-8 flex justify-center">
        <ToggleGroup aria-label="Billing period" value={[cycle]} onValueChange={changeCycle}>
          <Toggle value="monthly">Monthly</Toggle>
          <Toggle value="annual">
            Annual
            {annualNote && <span className="font-mono text-[10.5px] text-primary-text">{annualNote}</span>}
          </Toggle>
        </ToggleGroup>
      </div>
      <ul className={cn('mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-2', GRID[Math.min(Math.max(tiers.length, 1), 4) as 1 | 2 | 3 | 4])}>
        {tiers.map((tier) => {
          const price = cycle === 'annual' ? tier.priceAnnual : tier.priceMonthly;
          const tierId = `${titleId}-${tier.id}`;
          return (
            <li
              key={tier.id}
              aria-labelledby={tierId}
              className={cn(
                'relative flex flex-col rounded-xl bg-card p-6 shadow-sm',
                tier.highlighted ? 'border-2 border-primary' : 'border border-border',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <TierHeading id={tierId} className="text-[15px] font-semibold tracking-tight text-foreground">
                  {tier.name}
                </TierHeading>
                {tier.badge && (
                  <Badge tone="primary" shape="pill">
                    {tier.badge}
                  </Badge>
                )}
              </div>
              {tier.description && <p className="mt-1.5 text-[13px] text-muted-foreground">{tier.description}</p>}
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-[34px] font-semibold tracking-tight text-foreground tabular-nums">
                  {price == null ? 'Custom' : money.format(price)}
                </span>
                {price != null && <span className="text-[13px] text-muted-foreground">/ month</span>}
              </p>
              <p className="mt-1 h-4 text-[12px] text-muted-foreground">
                {price == null ? 'Tailored to your volume' : price === 0 ? 'Free forever' : cycle === 'annual' ? `${money.format(price * 12)} billed yearly` : 'Billed monthly'}
              </p>
              <Button
                variant={tier.highlighted ? 'primary' : 'secondary'}
                className="mt-6 w-full"
                aria-describedby={tierId}
                onClick={() => onSelectTier?.(tier, cycle)}
              >
                {tier.cta}
              </Button>
              <ul aria-label={`${tier.name} features`} className="mt-6 space-y-2.5 border-t border-border pt-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-foreground">
                    <Check size={15} aria-hidden className="mt-0.5 shrink-0 text-primary-text" />
                    {f}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
