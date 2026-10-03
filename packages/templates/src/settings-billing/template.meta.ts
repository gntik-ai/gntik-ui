import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Billing settings',
  family: 'Settings',
  priority: 'P2',
  status: 'beta',
  description: 'Current plan with billing cycle, quota meters, the default payment method and invoice history.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'plan-card', 'quota-meters', 'payment-method-card', 'invoice-table'],
};
