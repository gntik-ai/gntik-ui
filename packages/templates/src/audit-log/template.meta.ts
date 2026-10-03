import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Audit log',
  family: 'Work',
  priority: 'P2',
  status: 'beta',
  description: 'Workspace audit trail: FilterBar (search, actor / resource / result filters) and DateRangeFilter over a DataTable of events with actor, action, target and result; a drawer shows the change diff (CodeBlock); export to CSV.',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'filter-bar', 'date-range-filter', 'data-table', 'empty-states'],
};
