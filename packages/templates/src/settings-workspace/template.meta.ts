import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Workspace settings',
  family: 'Settings',
  priority: 'P1',
  status: 'beta',
  description: 'Workspace name, URL slug, logo upload and data region, with a danger zone for transfer and deletion.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'form-section', 'file-upload-panel', 'sticky-action-bar', 'danger-zone'],
};
