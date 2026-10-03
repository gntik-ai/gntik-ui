import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Upgrade required',
  family: 'System',
  priority: 'P2',
  status: 'beta',
  description: 'Plan gate inside the console: what the locked feature does, the current plan, and a PricingTable comparison whose CTA starts the upgrade.',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'inline-callout', 'pricing-table'],
};
