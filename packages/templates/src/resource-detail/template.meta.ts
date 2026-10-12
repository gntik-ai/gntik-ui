import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Resource detail',
  family: 'Resources',
  priority: 'P1',
  status: 'beta',
  description:
    'Resource detail with editable Overview, Activity and Settings tabs by default; optional readOnly (boolean, default false) uses only explicit header and detail props and one Overview tab, with optional history (readonly StatusEvent[], default undefined): omitted hides the history card, [] shows the named empty state, and events render exactly as supplied without invented actors. Read-only ignores activity, events, dangerActions, defaultTab, onSaveSettings and onDangerAction; explicit actions and onEditDetails are honored. The Resource sections tablist retains Tab, arrow, Home/End and Enter/Space keyboard navigation; history is a named group containing the Status history list or empty-state region. Uses token styling in dark (default), light and high_contrast. Examples: runtime-with-transition maps state and lastTransitionAt to one actor-free event, runtime-without-transition maps null to [], and realtime-configuration and postgres-table-detail omit history. ConsoleShell retains sample frame defaults unless explicit shell props are supplied, as in the examples.',
  layout: 'SidebarLayout + Page',
  blocks: [
    'app-sidebar',
    'app-topbar',
    'page-header',
    'description-list-card',
    'status-timeline',
    'activity-feed',
    'form-section',
    'danger-zone',
  ],
};
