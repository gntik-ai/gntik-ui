import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Getting started',
  family: 'Onboarding',
  priority: 'P2',
  status: 'beta',
  description: 'Onboarding checklist in the console shell: setup progress, checkable steps with a completion message, and cards linking to the docs.',
  layout: 'SidebarLayout + Page',
  blocks: ['app-sidebar', 'app-topbar', 'page-header'],
};
