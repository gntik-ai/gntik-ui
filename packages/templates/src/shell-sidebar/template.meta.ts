import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Sidebar shell',
  family: 'Shells',
  priority: 'P1',
  status: 'stable',
  description: 'Console starter: app sidebar, topbar and an empty Page with a title, description and a first-run empty state.',
  layout: 'SidebarLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'empty-states'],
};
