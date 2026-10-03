import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Board',
  family: 'Resources',
  priority: 'P3',
  status: 'experimental',
  description: 'Kanban board in the console: columns with counts, cards with priority, labels, due date and assignee; pointer drag-and-drop between and within columns, keyboard moves (Space to pick up, arrows to move, Space to drop, Escape to cancel) with live announcements, and a card detail Drawer whose status select also moves the card.',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header'],
};
