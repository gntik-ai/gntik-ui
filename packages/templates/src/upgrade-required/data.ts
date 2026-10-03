import { samplePricingTiers, type PricingTier } from '@gntik-ai/blocks';
import type { BreadcrumbItem } from '@gntik-ai/ui';

/** Neutral fixtures for the plan gate. */
export const upgradeContent = {
  feature: 'Audit log',
  requiredPlan: 'Team',
  currentPlan: 'Starter',
  description: 'Keep a searchable record of every change in your workspace: who did what, when, and what changed.',
};

export const upgradeBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Acme Industries', href: '/overview' },
  { label: 'Settings', href: '/settings' },
  { label: 'Audit log' },
];

/** The sample tiers with the current plan's CTA relabelled. */
export const upgradeTiers: PricingTier[] = samplePricingTiers.map((tier) =>
  tier.id === 'starter' ? { ...tier, cta: 'Current plan' } : tier,
);
