import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Members settings',
  family: 'Settings',
  priority: 'P1',
  status: 'beta',
  description: 'Workspace members with inline roles, pending invitations, an invite dialog and a role permission matrix.',
  layout: 'SettingsLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'members-table', 'pending-invitations', 'invite-members-dialog'],
};
