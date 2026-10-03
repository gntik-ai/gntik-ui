import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Resource index',
  family: 'Resources',
  priority: 'P1',
  status: 'beta',
  description: 'List page for any resource: header with the create action, filter bar with saved views, a selectable sortable table with pagination, a sticky bulk action bar and a no-results state.',
  layout: 'SidebarLayout + Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'filter-bar', 'data-table', 'pagination-footer', 'bulk-action-bar', 'empty-states'],
};
