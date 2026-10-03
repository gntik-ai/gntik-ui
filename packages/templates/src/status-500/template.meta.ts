import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: '500 Server error',
  family: 'System',
  priority: 'P1',
  status: 'beta',
  description: 'Full-page server error: StatusLayout message with an ErrorPanel (status code, copyable request id, retry, technical details) and links home and to the status page.',
  layout: 'StatusLayout',
  blocks: ['error-panel'],
};
