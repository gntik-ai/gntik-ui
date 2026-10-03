import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Model providers settings',
  family: 'AI',
  priority: 'P3',
  status: 'experimental',
  description:
    'Settings page (shared settings nav plus a "Model providers" item) with the ModelKeysList — masked keys, test connection, confirmed revoke — an add-key dialog (provider, endpoint for compatible / self-hosted, secret) and workspace usage limits as Meters.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'model-keys-list'],
};
