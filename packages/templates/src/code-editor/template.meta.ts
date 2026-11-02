import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Code editor',
  family: 'Builders',
  priority: 'P3',
  status: 'experimental',
  description:
    'Full-screen code editor: CanvasLayout top bar (breadcrumb, title, status, branch, Save), a file TreeList with a context menu (open, copy path, close tab, delete) in the palette, and the CodePanel block (file tabs, Monaco editor or diff, problems list) as the canvas. The Typography in palettes example demonstrates opt-in Inter, upright emphasis, sentence-case labels, scoped and nested editor mono fonts, and shared page-theme editor colours.',
  layout: 'CanvasLayout',
  blocks: ['code-panel'],
};
