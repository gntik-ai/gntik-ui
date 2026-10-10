import {
  Badge,
  Card,
  Toggle,
  ToggleGroup,
  cn,
  type BadgeTone,
} from "@gntik-ai/ui";
import { useEffect, useState, type ReactNode } from "react";
import { formatDate, formatMoney, type DateInput } from "../format";
import type { BillingCycle } from "./PlanCard";

/** Consumer data only: each summary region is optional. Prices are cycle totals. */
export interface SummaryPlan {
  name?: string;
  statusLabel?: string;
  statusTone?: BadgeTone;
  priceMonthly?: number;
  priceAnnual?: number;
  currency?: string;
  cycle?: BillingCycle;
  renewsOn?: DateInput;
  features?: string[];
}

export interface PlanSummaryProps {
  variant: "summary";
  plan?: SummaryPlan;
  emptyLabel?: string;
  /** Consumer-supplied kit Buttons or native links. No built-in actions. */
  actions?: ReactNode;
  defaultCycle?: BillingCycle;
  onCycleChange?: (cycle: BillingCycle) => void;
  titleAs?: "h2" | "h3" | "h4";
  className?: string;
}

export function PlanSummary({
  plan,
  emptyLabel,
  actions,
  defaultCycle = "monthly",
  onCycleChange,
  titleAs: TitleTag = "h3",
  className,
}: PlanSummaryProps) {
  const title = plan?.name || emptyLabel;
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);
  const hasBothPrices = plan?.priceMonthly != null && plan?.priceAnnual != null;
  const price = hasBothPrices
    ? cycle === "annual"
      ? plan.priceAnnual
      : plan.priceMonthly
    : (plan?.priceMonthly ?? plan?.priceAnnual);
  const changeCycle = (values: string[]) => {
    const next = values[0];
    if (next !== "monthly" && next !== "annual") return;
    setCycle(next);
    onCycleChange?.(next);
  };
  useEffect(() => {
    if (!title && process.env.NODE_ENV === "development") {
      console.warn("PlanCard summary: supply a plan name or emptyLabel.");
    }
  }, [title]);
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {title && (
          <TitleTag className="text-lg font-semibold text-foreground">
            {title}
          </TitleTag>
        )}
        {plan?.statusLabel && (
          <Badge tone={plan.statusTone ?? "neutral"} dot>
            {plan.statusLabel}
          </Badge>
        )}
      </div>
      {plan?.renewsOn != null && (
        <p className="mt-1 text-sm text-muted-foreground">
          Renews {formatDate(plan.renewsOn)}
        </p>
      )}
      {price != null && (
        <p className="mt-4 text-3xl font-semibold text-foreground tabular-nums">
          {formatMoney(price, plan?.currency, true)}
        </p>
      )}
      {plan?.cycle && (
        <p className="mt-1 text-sm text-muted-foreground">
          {(hasBothPrices ? cycle : plan.cycle) === "annual"
            ? "Billed annually"
            : "Billed monthly"}
        </p>
      )}
      {hasBothPrices && (
        <ToggleGroup
          className="mt-4"
          size="sm"
          aria-label="Billing cycle"
          value={[cycle]}
          onValueChange={changeCycle}
        >
          <Toggle value="monthly">Monthly</Toggle>
          <Toggle value="annual">Annual</Toggle>
        </ToggleGroup>
      )}
      {plan?.features && plan.features.length > 0 && (
        <ul
          aria-label="Plan features"
          className="mt-5 grid gap-2 border-t border-border pt-5 text-sm text-foreground sm:grid-cols-2"
        >
          {plan.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}
      {actions && (
        <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </Card>
  );
}
