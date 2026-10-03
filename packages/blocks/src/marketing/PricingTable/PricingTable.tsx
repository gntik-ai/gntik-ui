import { useId, useState, type MouseEvent, type ReactNode } from 'react';
import { Badge, Button, Radio, RadioGroup, Toggle, ToggleGroup, cn } from '@gntik-ai/ui';
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
  /** Level of the section title; tier names use the next level (or this one when there is no title). */
  headingLevel?: 'h2' | 'h3';
  /** Shows the monthly/annual toggle (default true). */
  showCycleToggle?: boolean;
  /** Columns at the widest breakpoint (default: one per tier, up to 4). */
  columns?: 1 | 2 | 3 | 4;
  /** Names the tier list / radio group when `title` is null (the block then renders no landmark), e.g. inside a wizard step. */
  'aria-label'?: string;
  /** Id of an external heading that names the section when `title` is null. */
  'aria-labelledby'?: string;
  /**
   * Id of the tier the account is on: its card gets a "Current plan" badge and
   * `aria-current`, and its CTA becomes a disabled "Current plan" button.
   */
  currentTierId?: string;
  /** Label of the current tier's badge and disabled CTA. */
  currentPlanLabel?: string;
  /**
   * Turns the tiers into a single-choice radio group (role radiogroup/radio, arrow keys,
   * selected card with a primary border and a check). CTAs are not rendered in this mode.
   */
  selectable?: boolean;
  /** Selected tier id (controlled, `selectable` only). */
  value?: string;
  /** Initially selected tier id (uncontrolled, `selectable` only). */
  defaultValue?: string;
  /** Called with the newly selected tier id (`selectable` only). */
  onValueChange?: (value: string) => void;
  className?: string;
}

const CARD = 'relative flex flex-col rounded-xl bg-card p-6 shadow-sm';
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
  showCycleToggle = true,
  columns,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  currentTierId,
  currentPlanLabel = 'Current plan',
  selectable = false,
  value,
  defaultValue,
  onValueChange,
  className,
}: PricingTableProps) {
  const titleId = useId();
  const [cycle, setCycle] = useState<PricingCycle>(defaultCycle);
  const [innerValue, setInnerValue] = useState(defaultValue);
  const selected = value !== undefined ? value : innerValue;
  const hasTitle = title != null && title !== false && title !== '';
  const hasHeader = hasTitle || Boolean(eyebrow) || Boolean(description);
  const TierHeading: 'h2' | 'h3' | 'h4' = !hasTitle ? Heading : Heading === 'h2' ? 'h3' : 'h4';
  // Without a title the block is not a landmark of its own: the list / radio group carries the name.
  const Wrapper = hasTitle ? 'section' : 'div';
  const labelling = hasTitle ? { 'aria-labelledby': titleId } : { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy };
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
  const cols = columns ?? (Math.min(Math.max(tiers.length, 1), 4) as 1 | 2 | 3 | 4);
  const gridClass = cn(
    'mx-auto grid max-w-6xl gap-6',
    (hasHeader || showCycleToggle) && 'mt-10',
    cols > 1 && 'md:grid-cols-2',
    GRID[cols],
  );
  const bodyProps = { cycle, money, TierHeading, currentTierId, currentPlanLabel };

  const select = (id: string) => {
    if (id === selected) return;
    if (value === undefined) setInnerValue(id);
    onValueChange?.(id);
  };

  const changeCycle = (value: string[]) => {
    const next = value[0];
    if (next !== 'monthly' && next !== 'annual') return;
    setCycle(next);
    onCycleChange?.(next);
  };

  return (
    <Wrapper {...(hasTitle ? labelling : {})} className={cn('px-4 py-16 sm:px-6 sm:py-20', className)}>
      {hasHeader && (
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && <p className="font-mono text-[12px] font-semibold tracking-wide text-primary-text uppercase">{eyebrow}</p>}
          {hasTitle && (
            <Heading id={titleId} className="mt-2 text-[28px] leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-[34px]">
              {title}
            </Heading>
          )}
          {description && <p className="mt-4 text-[15.5px] leading-relaxed text-pretty text-muted-foreground">{description}</p>}
        </div>
      )}
      {showCycleToggle && (
        <div className={cn('flex justify-center', hasHeader && 'mt-8')}>
          <ToggleGroup aria-label="Billing period" value={[cycle]} onValueChange={changeCycle}>
            <Toggle value="monthly">Monthly</Toggle>
            <Toggle value="annual">
              Annual
              {annualNote && <span className="font-mono text-[10.5px] text-primary-text">{annualNote}</span>}
            </Toggle>
          </ToggleGroup>
        </div>
      )}
      {selectable ? (
        <RadioGroup
          {...labelling}
          value={selected ?? ''}
          onValueChange={(v) => select(String(v))}
          className={gridClass}
        >
          {tiers.map((tier) => {
            const tierId = `${titleId}-${tier.id}`;
            const isSelected = selected === tier.id;
            const onCardClick = (event: MouseEvent<HTMLDivElement>) => {
              if (!(event.target instanceof Element) || !event.target.closest('[role="radio"]')) select(tier.id);
            };
            return (
              // The radio inside is the keyboard target; the card click is a pointer convenience.
              <div
                key={tier.id}
                data-selected={isSelected || undefined}
                aria-current={tier.id === currentTierId ? 'true' : undefined}
                onClick={onCardClick}
                className={cn(
                  CARD,
                  'cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring',
                  isSelected ? 'border-2 border-primary' : 'border border-border hover:border-muted-foreground/40',
                )}
              >
                <TierBody
                  tier={tier}
                  {...bodyProps}
                  tierId={tierId}
                  selected={isSelected}
                  control={<Radio value={tier.id} aria-labelledby={tierId} aria-describedby={`${tierId}-price`} />}
                />
              </div>
            );
          })}
        </RadioGroup>
      ) : (
        <ul {...(hasTitle ? {} : labelling)} className={gridClass}>
          {tiers.map((tier) => {
            const tierId = `${titleId}-${tier.id}`;
            const isCurrent = tier.id === currentTierId;
            return (
              <li
                key={tier.id}
                aria-labelledby={tierId}
                aria-current={isCurrent ? 'true' : undefined}
                className={cn(CARD, tier.highlighted ? 'border-2 border-primary' : 'border border-border')}
              >
                <TierBody
                  tier={tier}
                  {...bodyProps}
                  tierId={tierId}
                  action={
                    <Button
                      variant={tier.highlighted && !isCurrent ? 'primary' : 'secondary'}
                      className="mt-6 w-full"
                      aria-describedby={tierId}
                      disabled={isCurrent}
                      onClick={() => onSelectTier?.(tier, cycle)}
                    >
                      {isCurrent ? currentPlanLabel : tier.cta}
                    </Button>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </Wrapper>
  );
}

interface TierBodyProps {
  tier: PricingTier;
  tierId: string;
  cycle: PricingCycle;
  money: Intl.NumberFormat;
  TierHeading: 'h2' | 'h3' | 'h4';
  currentTierId?: string;
  currentPlanLabel: string;
  /** Radio control (selectable mode). */
  control?: ReactNode;
  selected?: boolean;
  /** CTA (default mode). */
  action?: ReactNode;
}

function TierBody({ tier, tierId, cycle, money, TierHeading, currentTierId, currentPlanLabel, control, selected, action }: TierBodyProps) {
  const price = cycle === 'annual' ? tier.priceAnnual : tier.priceMonthly;
  const isCurrent = tier.id === currentTierId;
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {control}
          <TierHeading id={tierId} className="text-[15px] font-semibold tracking-tight text-foreground">
            {tier.name}
          </TierHeading>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isCurrent && (
            <Badge tone="neutral" shape="pill">
              {currentPlanLabel}
            </Badge>
          )}
          {tier.badge && (
            <Badge tone="primary" shape="pill">
              {tier.badge}
            </Badge>
          )}
          {selected && (
            <span data-testid="tier-check" className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check size={13} strokeWidth={2.6} aria-hidden />
            </span>
          )}
        </div>
      </div>
      {tier.description && <p className="mt-1.5 text-[13px] text-muted-foreground">{tier.description}</p>}
      <div id={`${tierId}-price`}>
        <p className="mt-5 flex items-baseline gap-1.5">
          <span className="text-[34px] font-semibold tracking-tight text-foreground tabular-nums">
            {price == null ? 'Custom' : money.format(price)}
          </span>
          {price != null && <span className="text-[13px] text-muted-foreground">/ month</span>}
        </p>
        <p className="mt-1 h-4 text-[12px] text-muted-foreground">
          {price == null ? 'Tailored to your volume' : price === 0 ? 'Free forever' : cycle === 'annual' ? `${money.format(price * 12)} billed yearly` : 'Billed monthly'}
        </p>
      </div>
      {action}
      <ul aria-label={`${tier.name} features`} className="mt-6 space-y-2.5 border-t border-border pt-6">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px] text-foreground">
            <Check size={15} aria-hidden className="mt-0.5 shrink-0 text-primary-text" />
            {f}
          </li>
        ))}
      </ul>
    </>
  );
}
