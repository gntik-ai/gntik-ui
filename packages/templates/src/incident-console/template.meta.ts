import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Incident console',
  family: 'Overview',
  priority: 'P3',
  status: 'experimental',
  description: 'Incident triage in the console: a SplitLayout alert rail filtered with PowerSearch (severity, status, service, assignee; default “not resolved”), sorted by severity, with a detail pane showing the elapsed Timer, Acknowledge / Resolve actions and the StatusTimeline of events.',
  layout: 'SidebarLayout · Page · SplitLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'status-timeline'],
};
