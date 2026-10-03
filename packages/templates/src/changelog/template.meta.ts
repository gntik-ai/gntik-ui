import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Changelog',
  family: 'Help',
  priority: 'P3',
  status: 'experimental',
  description: 'Release notes in the console: dated entries with version, tag badges and a “New” badge, a multi-select tag filter (ToggleGroup) with a live count, and a Subscribe action.',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header'],
};
