import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Create wizard',
  family: 'Resources',
  priority: 'P2',
  status: 'beta',
  description: 'Focus-mode create flow: details, source (selectable cards), configuration and a review step with editable summary cards.',
  layout: 'WizardLayout',
  blocks: ['description-list-card'],
};
