import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Create wizard',
  family: 'Resources',
  priority: 'P2',
  status: 'beta',
  description: 'Focus-mode create flow: details, source, configuration and editable review cards. Page mode is the default; mode="overlay" mounts over an existing list without a new route. Overlay size defaults to fullscreen; size="dialog" uses a popup (fullscreen on mobile). Keep it mounted to preserve answers and the current step on close. The examples/Overlay.tsx demo goes from a list through Finish with step-local ErrorPanel and FirstRunEmpty surfaces. For a consumer-owned step model and validation/review slots, use dialog-wizard (default dialog size).',
  layout: 'WizardLayout',
  blocks: ['description-list-card', 'error-panel', 'empty-states'],
};
