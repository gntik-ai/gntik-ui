import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Messaging',
  family: 'Work',
  priority: 'P3',
  status: 'experimental',
  description: 'Team messaging in the console: SplitLayout conversation list (unread counts, last message) → thread of ChatMessages with Thumbnail attachments, participants AvatarGroup, and a ChatComposer with file attachments; Back on small screens.',
  layout: 'SidebarLayout · Page · SplitLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header'],
};
