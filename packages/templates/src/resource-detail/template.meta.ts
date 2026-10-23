import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Resource detail',
  family: 'Resources',
  priority: 'P1',
  status: 'beta',
  description:
    'Resource detail with editable Overview, Activity and Settings tabs by default; optional readOnly (boolean, default false) uses only explicit header and detail props and one Overview tab, with optional history (readonly StatusEvent[], default undefined): omitted hides the history card, [] shows the named empty state, and events render exactly as supplied without invented actors. Read-only ignores activity, events, dangerActions, defaultTab, onSaveSettings and onDangerAction; explicit actions and onEditDetails are honored. The Resource sections tablist retains Tab, arrow, Home/End and Enter/Space keyboard navigation; history is a named group containing the Status history list or empty-state region. Uses token styling in dark (default), light and high_contrast. Examples: runtime-with-transition maps state and lastTransitionAt to one actor-free event, runtime-without-transition maps null to [], and realtime-configuration and postgres-table-detail omit history. Optional labels?: Partial<ResourceDetailLabels> overrides overview, activity, settings and sections (all strings). Unset keys use I18nProvider (en/es); no provider keeps English. Only the tabs and tablist are localized by this template; fixtures and other section text are unchanged. readOnly keeps only the localized overview tab. See the Catalog labels live preview. ConsoleShell retains sample frame defaults when shell is omitted or an object. shell={null} renders only Page and PageHeader, with breadcrumbs in the header; pass breadcrumbs or [] to avoid the editable sample trail. The host owns main and provides ChartLocaleProvider for custom chart locales. Optional tabs?: { value: string; label: string; content: ReactNode }[] replaces the built-in tabs in caller order, even with readOnly; [] hides the tab set. With custom tabs, defaultTab and onTabChange use string values; an omitted or unknown defaultTab selects the first tab. Without tabs they retain ResourceDetailTab values. Custom tabs use the same Base UI keyboard navigation and panel mounting. See the embedded-custom-tabs live preview for shell-less composition inside a host main.',
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
