import { memberRoles, samplePricingTiers, type PricingTier, type RoleOption } from '@gntik-ai/blocks';
import type { StepItem } from '@gntik-ai/ui';

export interface WorkspaceValues {
  name: string;
  region: string;
  plan: string;
  invites: string[];
  role: string;
}

export interface WorkspaceRegion {
  value: string;
  title: string;
  description: string;
  meta: string;
}

export const workspaceSteps: StepItem[] = [
  { id: 'name', label: 'Workspace' },
  { id: 'region', label: 'Region' },
  { id: 'plan', label: 'Plan' },
  { id: 'invite', label: 'Invite' },
];

export const workspaceRegions: WorkspaceRegion[] = [
  { value: 'eu', title: 'Europe', description: 'Frankfurt and Ireland', meta: 'GDPR data residency' },
  { value: 'us', title: 'United States', description: 'Virginia and Oregon', meta: 'Lowest latency in the Americas' },
  { value: 'ap', title: 'Asia Pacific', description: 'Mumbai and Singapore', meta: 'Lowest latency in Asia' },
];

export const workspacePlans: PricingTier[] = samplePricingTiers;
export const workspaceRoles: RoleOption[] = memberRoles;

export const workspaceInitialValues: WorkspaceValues = { name: '', region: 'eu', plan: 'team', invites: [], role: 'member' };

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** URL-safe slug for the workspace address. */
export const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** "$49 / month", "Free" or "Custom pricing". */
export const planPrice = (tier: PricingTier) =>
  tier.priceMonthly == null ? 'Custom pricing' : tier.priceMonthly === 0 ? 'Free' : `${usd.format(tier.priceMonthly)} / month`;
