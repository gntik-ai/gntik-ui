import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Security settings',
  family: 'Settings',
  priority: 'P1',
  status: 'beta',
  description: 'Password change, two-factor setup with a one-time code dialog, and signed-in sessions and devices.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'form-section', 'settings-row', 'sessions-devices'],
};
