import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Incident board',
  family: 'Overview',
  priority: 'P3',
  status: 'experimental',
  description: 'Incident triage Kanban in the console: page header with Export / Declare incident, a KPI strip (open, SEV1, unassigned, resolved), a FilterBar (search, severity, service, owner) and a KanbanBoard by stage (Triage · Investigating · Mitigated · Resolved) whose cards show severity, owner and age; pointer and keyboard moves with live announcements, and a details Drawer whose stage select also moves the card.',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'kpi-row', 'filter-bar'],
};
