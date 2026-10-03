import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Resource form',
  family: 'Resources',
  priority: 'P1',
  status: 'beta',
  description: 'Long create/edit form: two-column form sections, an error summary that links to each invalid field after submit, and a sticky save bar that tracks unsaved changes.',
  layout: 'SidebarLayout + Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'form-section', 'validation-summary', 'sticky-action-bar'],
};
