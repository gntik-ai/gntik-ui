import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Usage analytics',
  family: 'Overview',
  priority: 'P2',
  status: 'beta',
  description: 'Analytics page: date range and filter bar, spend and traffic charts, a sortable breakdown table and a CSV export action.',
  layout: 'SidebarLayout + Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'date-range-filter', 'filter-bar', 'chart-card', 'data-table', 'empty-states'],
};
