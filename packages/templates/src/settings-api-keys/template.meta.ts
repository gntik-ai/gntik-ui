import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'API keys settings',
  family: 'Settings',
  priority: 'P2',
  status: 'beta',
  description: 'API key list with scopes and last use, a create-key dialog that shows the secret once, and typed revoke confirmation.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'data-table', 'create-api-key-dialog', 'confirm-destructive'],
};
