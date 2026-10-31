import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Sidebar shell',
  family: 'Shells',
  priority: 'P1',
  status: 'stable',
  description:
    'Console starter: app sidebar, topbar and an empty Page. Optional tenant selection, workspace context, a named busy region, account-menu content and a brand slot are shared through ConsoleShell.',
  layout: 'SidebarLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'empty-states'],
};
