import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Data explorer',
  family: 'Builders',
  priority: 'P3',
  status: 'experimental',
  description:
    'Explore a large dataset inside the console: a PowerSearch (field filters, comparisons, free text) over a 10k-row DataTable with client sorting and pagination, a column chooser (TransferList in a Dialog: show, hide, reorder) and a row inspector (Drawer + JsonViewer).',
  layout: 'SidebarLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'data-table', 'empty-states'],
};
