import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Sidebar shell',
  family: 'Shells',
  priority: 'P1',
  status: 'stable',
  description:
    'Console starter: app sidebar, topbar and an empty Page. ConsoleShell shares optional tenant selection (tenantPlaceholder), empty workspace menus (workspaceEmptyText), navigation naming (navLabel), a named busy region, account-menu content and a brand slot. userMenuShowTheme=false hides the footer Theme item; a defined topbar.user overrides only the topbar account, with null hiding it.',
  layout: 'SidebarLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'empty-states'],
};
