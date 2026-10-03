import type { PricingTier } from './PricingTable';

/** Sample three-tier pricing. Prices are per month; annual is per month billed yearly. */
export const samplePricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals and small side projects.',
    priceMonthly: 0,
    priceAnnual: 0,
    cta: 'Start for free',
    features: ['1 project', '3 members', '50,000 requests / month', 'Community support'],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For growing teams shipping every day.',
    priceMonthly: 49,
    priceAnnual: 39,
    cta: 'Start free trial',
    highlighted: true,
    badge: 'Most popular',
    features: ['Unlimited projects', '25 members', '500,000 requests / month', 'Preview deployments', 'Email support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations with advanced security needs.',
    priceMonthly: null,
    priceAnnual: null,
    cta: 'Contact sales',
    features: ['Everything in Team', 'SSO and audit log', 'Custom quotas', 'Data residency', 'Dedicated support'],
  },
];
