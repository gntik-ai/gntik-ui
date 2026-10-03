import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Search results',
  family: 'Work',
  priority: 'P2',
  status: 'beta',
  description: 'Workspace search: query field, facets as Checkbox groups with counts, results grouped by type under SectionHeaders, arrow-key navigation through the results, and NoResultsEmpty.',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'section-header', 'empty-states'],
};
