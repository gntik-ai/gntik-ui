import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Keyboard shortcuts',
  family: 'Help',
  priority: 'P3',
  status: 'experimental',
  description: 'Searchable shortcut sheet grouped by area (KbdCombo, “G then P” sequences), as a console page and as a Dialog variant (KeyboardShortcutsDialog) for the ? shortcut.',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header'],
};
