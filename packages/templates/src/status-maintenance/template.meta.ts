import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Maintenance',
  family: 'System',
  priority: 'P1',
  status: 'beta',
  description: 'Full-page maintenance state: message, Check again and a status page link, with a maintenance SystemBanner carrying the window and a subscribe link.',
  layout: 'StatusLayout',
  blocks: ['system-banner'],
};
