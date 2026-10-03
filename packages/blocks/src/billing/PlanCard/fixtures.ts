import type { BillingPlan } from './PlanCard';

/** Sample current plan (neutral workspace data). */
export const samplePlan: BillingPlan = {
  name: 'Scale',
  status: 'active',
  priceMonthly: 1200,
  priceAnnual: 1000,
  currency: 'USD',
  renewsOn: '2026-06-01',
  summary: '50 seats · 2 regions',
  features: ['500,000 requests / month', '120M tokens / month', '20 GB storage', 'Audit log and SSO', 'Email support · 1 business day'],
};
