import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Flow builder',
  family: 'Builders',
  priority: 'P3',
  status: 'experimental',
  description:
    'Full-screen editor: CanvasLayout top bar (breadcrumb, title, status, Save and Publish) around the FlowBuilder block (palette, React Flow canvas, inspector, run console). The app must import \'@gntik-ai/flow/styles.css\' once for the canvas styles.',
  layout: 'CanvasLayout',
  blocks: ['flow-builder'],
};
