import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Run trace',
  family: 'AI',
  priority: 'P3',
  status: 'experimental',
  description:
    'Trace of one AI run inside the console: run header with a live elapsed Timer, TraceWaterfall of spans, token cost and the run log; a pinnable inspector shows the selected span with a live Timer while it runs and its input / output in JsonViewers.',
  layout: 'InspectorLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'trace-waterfall', 'token-cost-card', 'log-viewer'],
};
