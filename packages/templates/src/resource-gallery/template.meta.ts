import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Resource gallery',
  family: 'Resources',
  priority: 'P2',
  status: 'beta',
  description: 'Card gallery of resources with a toolbar (search, grid/table view toggle, create action), per-card actions and a no-results state.',
  layout: 'SidebarLayout + Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'page-toolbar', 'resource-card-grid', 'data-table', 'empty-states'],
};
