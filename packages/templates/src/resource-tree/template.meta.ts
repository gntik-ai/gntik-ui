import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Resource tree',
  family: 'Resources',
  priority: 'P3',
  status: 'experimental',
  description: 'Resource index with a team → project TreeList (counts, single selection) beside grouped DataTables (group by kind, region or team; one SectionHeader + table per group), StatusTag status and OverflowList tags.',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'section-header', 'data-table'],
};
