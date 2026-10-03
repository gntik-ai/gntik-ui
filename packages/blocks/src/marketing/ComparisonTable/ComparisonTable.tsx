import { useId, type ReactNode } from 'react';
import { Check, Minus } from '@gntik-ai/icons';
import { Badge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, cn } from '@gntik-ai/ui';
import { ActionButton, type MarketingAction } from '../actions';
import { sampleComparisonPlans, sampleComparisonSections } from './fixtures';

/** A plan or option: one column of the comparison. */
export interface ComparisonPlan {
  id: string;
  name: string;
  /** Headline price or figure under the name ("$49", "Custom"). */
  price?: ReactNode;
  /** Small text after the price ("per month"). */
  priceNote?: ReactNode;
  /** Call to action under the price. */
  cta?: MarketingAction;
}

/** A plain value, or a value with a short note under it ("Add-on"). */
export type ComparisonValue = boolean | string | number | null | undefined | { value: boolean | string | number | null; note?: string };

export interface ComparisonFeature {
  id: string;
  label: string;
  /** Muted text under the label. */
  description?: string;
  /** Value per plan id. Missing / null values render like `false` (a dash, "Not included"). */
  values: Readonly<Record<string, ComparisonValue>>;
}

export interface ComparisonSection {
  id: string;
  title: string;
  features: ComparisonFeature[];
}

export interface ComparisonTableProps {
  plans?: ComparisonPlan[];
  sections?: ComparisonSection[];
  /** Plan column marked as recommended: badge text, a primary top rule and a tinted column. */
  highlightedPlanId?: string;
  /** Text of the recommended badge (default "Recommended"). */
  highlightLabel?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Level of the section title (default h2). */
  headingLevel?: 'h2' | 'h3';
  /** Table name (screen-reader caption). Default: the title when it is a string, else "Plan comparison". */
  caption?: string;
  /** Header of the feature column (screen-reader only unless `showFeatureHeader`). */
  featureHeader?: string;
  showFeatureHeader?: boolean;
  /** Screen-reader text of `true` (default "Included"). */
  includedLabel?: string;
  /** Screen-reader text of `false` / missing values (default "Not included"). */
  notIncludedLabel?: string;
  /** Formats numeric values (default: en-US grouping). */
  formatNumber?: (value: number, feature: ComparisonFeature) => string;
  className?: string;
}

const number = new Intl.NumberFormat('en-US');
const STICKY = 'sticky start-0 z-10 bg-card';

/**
 * Feature comparison of plans or options: columns are plans, rows are features grouped by section.
 * Booleans render as a check or a dash with screen-reader text; text and numbers render as is. The
 * table scrolls sideways on narrow screens with the feature column pinned.
 */
export function ComparisonTable({
  plans = sampleComparisonPlans,
  sections = sampleComparisonSections,
  highlightedPlanId = 'team',
  highlightLabel = 'Recommended',
  eyebrow = 'Compare plans',
  title = 'Find the plan that fits',
  description,
  headingLevel: Heading = 'h2',
  caption,
  featureHeader = 'Feature',
  showFeatureHeader = false,
  includedLabel = 'Included',
  notIncludedLabel = 'Not included',
  formatNumber = (v) => number.format(v),
  className,
}: ComparisonTableProps) {
  const titleId = useId();
  const hasTitle = title != null && title !== false && title !== '';
  const tableName = caption ?? (typeof title === 'string' && title ? title : 'Plan comparison');
  const columns = plans.length + 1;
  const isHighlighted = (plan: ComparisonPlan) => plan.id === highlightedPlanId;
  const Wrapper = hasTitle ? 'section' : 'div';

  const renderValue = (raw: ComparisonValue, feature: ComparisonFeature) => {
    const { value, note } = raw !== null && typeof raw === 'object' ? raw : { value: raw, note: undefined };
    let content: ReactNode;
    if (value === true) {
      content = (
        <>
          <Check size={16} aria-hidden className="inline-block text-primary-text" />
          <span className="sr-only">{includedLabel}</span>
        </>
      );
    } else if (value === false || value == null || value === '') {
      content = (
        <>
          <Minus size={16} aria-hidden className="inline-block text-muted-foreground" />
          <span className="sr-only">{notIncludedLabel}</span>
        </>
      );
    } else {
      content = <span className="text-foreground">{typeof value === 'number' ? formatNumber(value, feature) : value}</span>;
    }
    return (
      <>
        {content}
        {note && <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{note}</span>}
      </>
    );
  };

  return (
    <Wrapper aria-labelledby={hasTitle ? titleId : undefined} className={cn('px-4 py-16 sm:px-6 sm:py-20', className)}>
      {(hasTitle || eyebrow || description) && (
        <div className="mx-auto mb-10 max-w-2xl text-center">
          {eyebrow && <p className="font-mono text-[12px] font-semibold tracking-wide text-primary-text uppercase">{eyebrow}</p>}
          {hasTitle && (
            <Heading id={titleId} className="mt-2 text-[28px] leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-[34px]">
              {title}
            </Heading>
          )}
          {description && <p className="mt-4 text-[15.5px] leading-relaxed text-pretty text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table containerLabel={`${tableName}, scrollable`} className="min-w-[40rem] table-fixed">
          <TableCaption srOnly>{tableName}</TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(STICKY, 'w-[34%] min-w-44 align-bottom')}>
                <span className={showFeatureHeader ? undefined : 'sr-only'}>{featureHeader}</span>
              </TableHead>
              {plans.map((plan) => {
                const highlighted = isHighlighted(plan);
                return (
                  <TableHead
                    key={plan.id}
                    data-highlighted={highlighted || undefined}
                    className={cn(
                      'h-auto px-4 pt-5 pb-4 align-top tracking-normal whitespace-normal normal-case',
                      highlighted ? 'border-t-2 border-t-primary bg-primary/6' : 'bg-card',
                    )}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-foreground">{plan.name}</span>
                      {highlighted && (
                        <Badge tone="primary" shape="pill" size="sm">
                          {highlightLabel}
                        </Badge>
                      )}
                    </span>
                    {plan.price != null && (
                      <span className="mt-2 block">
                        <span className="text-[22px] font-semibold tracking-tight text-foreground tabular-nums">{plan.price}</span>
                        {plan.priceNote && <span className="ms-1.5 text-[12px] font-normal text-muted-foreground">{plan.priceNote}</span>}
                      </span>
                    )}
                    {plan.cta && (
                      <ActionButton action={plan.cta} variant={highlighted ? 'primary' : 'secondary'} size="md" className="mt-4 w-full" />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          {sections.map((section) => (
            <TableBody key={section.id} data-section={section.id} className="[&>tr:last-child>td]:border-b [&>tr:last-child>th]:border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead scope="rowgroup" colSpan={columns} className="h-10 bg-secondary/50 text-[12px] font-semibold text-foreground">
                  {/* The text stays in view while the table scrolls sideways. */}
                  <span className={cn(STICKY, 'bg-transparent')}>{section.title}</span>
                </TableHead>
              </TableRow>
              {section.features.map((feature) => (
                <TableRow key={feature.id}>
                  <TableHead
                    scope="row"
                    className={cn(STICKY, 'h-auto py-3 text-[13px] font-medium tracking-normal whitespace-normal text-foreground normal-case')}
                  >
                    {feature.label}
                    {feature.description && <span className="mt-0.5 block text-[12px] font-normal text-muted-foreground">{feature.description}</span>}
                  </TableHead>
                  {plans.map((plan) => (
                    <TableCell
                      key={plan.id}
                      data-highlighted={isHighlighted(plan) || undefined}
                      className={cn('text-[13px]', isHighlighted(plan) && 'bg-primary/6')}
                    >
                      {renderValue(feature.values[plan.id], feature)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ))}
        </Table>
      </div>
    </Wrapper>
  );
}
