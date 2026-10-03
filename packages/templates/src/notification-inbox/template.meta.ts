import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Notification inbox',
  family: 'Work',
  priority: 'P2',
  status: 'beta',
  description: 'Master–detail inbox in the console: All / Unread / Mentions filter (ToggleGroup), read and unread rows, a detail pane with Open, Mark as unread and Archive, and Back on small screens.',
  layout: 'SidebarLayout · Page · SplitLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header'],
};
