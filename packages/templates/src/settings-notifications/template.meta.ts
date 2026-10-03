import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Notification settings',
  family: 'Settings',
  priority: 'P2',
  status: 'beta',
  description: 'Event × channel notification matrix with bulk row and column toggles and a sticky save bar.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'notification-matrix', 'sticky-action-bar'],
};
