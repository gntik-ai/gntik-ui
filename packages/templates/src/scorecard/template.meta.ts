import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Scorecard',
  family: 'Overview',
  priority: 'P3',
  status: 'experimental',
  description: 'Period-over-period scorecard: period select, KpiRow with deltas vs. the previous period, a targets table (change, target, attainment Meter, MiniBar trend), a RadarChart of dimension scores and a commentary rail (CommentThread).',
  layout: 'SidebarLayout · Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'kpi-row', 'comment-thread'],
};
