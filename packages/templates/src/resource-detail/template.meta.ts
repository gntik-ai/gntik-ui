import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Resource detail',
  family: 'Resources',
  priority: 'P1',
  status: 'beta',
  description: 'Detail page for one resource: header with status, meta and actions, then Overview (details + status history), Activity and Settings (general form + danger zone) tabs.',
  layout: 'SidebarLayout + Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'description-list-card', 'status-timeline', 'activity-feed', 'form-section', 'danger-zone'],
};
