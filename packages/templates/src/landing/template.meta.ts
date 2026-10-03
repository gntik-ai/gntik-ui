import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Landing',
  family: 'Overview',
  priority: 'P3',
  status: 'experimental',
  description: 'Public landing: Hero, FeatureGrid, PricingTable, Faq',
  layout: 'StackedLayout',
  blocks: ['hero', 'feature-grid', 'pricing-table', 'faq'],
};
