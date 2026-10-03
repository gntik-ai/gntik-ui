import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Code editor',
  family: 'Builders',
  priority: 'P3',
  status: 'experimental',
  description:
    'Full-screen code editor: CanvasLayout top bar (breadcrumb, title, status, branch, Save), a file TreeList with a context menu (open, copy path, close tab, delete) in the palette, and the CodePanel block (file tabs, Monaco editor or diff, problems list) as the canvas.',
  layout: 'CanvasLayout',
  blocks: ['code-panel'],
};
