import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Top-nav shell',
  family: 'Shells',
  priority: 'P1',
  status: 'stable',
  description: 'Top-navigation starter: brand, primary links (drawer on small screens), search, notifications, theme and user menu, a page header and an empty body.',
  layout: 'StackedLayout',
  blocks: ['app-topbar', 'page-header', 'empty-states'],
};
