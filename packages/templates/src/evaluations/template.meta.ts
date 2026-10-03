import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Evaluations',
  family: 'AI',
  priority: 'P3',
  status: 'experimental',
  description:
    'Evaluation run review: EvaluationScorecard with one row per dataset, a diverging Heatmap of the score change vs baseline (metric × dataset), a regressions DataTable and a sample viewer (Drawer + JsonViewer, failures first) per dataset.',
  layout: 'SidebarLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header', 'evaluation-scorecard', 'data-table'],
};
