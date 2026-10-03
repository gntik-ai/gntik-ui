import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Integrations settings',
  family: 'Settings',
  priority: 'P2',
  status: 'beta',
  description: 'Connector cards with on/off switches, webhook endpoints and a filterable delivery log.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'settings-row'],
};
