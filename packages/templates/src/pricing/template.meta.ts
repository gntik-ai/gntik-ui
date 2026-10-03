import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Pricing',
  family: 'Overview',
  priority: 'P3',
  status: 'experimental',
  description: 'Public pricing page: StackedLayout with a MegaMenu (MobileNav below lg), PricingTable with the monthly / annual toggle, FeatureGrid highlights, a plan comparison table grouped by section, and Faq.',
  layout: 'StackedLayout',
  blocks: ['pricing-table', 'feature-grid', 'faq'],
};
