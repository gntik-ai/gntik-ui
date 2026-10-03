import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Home dashboard',
  family: 'Overview',
  priority: 'P1',
  status: 'beta',
  description: 'Workspace home in the console shell: page header, KPI row, cost and traffic charts, recent activity and quick-action cards.',
  layout: 'SidebarLayout + Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'kpi-row', 'chart-card', 'activity-feed'],
};
