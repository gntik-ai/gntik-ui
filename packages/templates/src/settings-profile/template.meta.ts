import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Profile settings',
  family: 'Settings',
  priority: 'P1',
  status: 'beta',
  description: 'Personal profile: avatar header, name and email, locale and time zone, with a sticky save bar.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'profile-header', 'form-section', 'sticky-action-bar'],
};
