import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Appearance settings',
  family: 'Settings',
  priority: 'P2',
  status: 'beta',
  description: 'Theme switcher wired to the ThemeProvider, table density and interface language.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'settings-row'],
};
