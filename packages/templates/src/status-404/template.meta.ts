import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: '404 Not found',
  family: 'System',
  priority: 'P1',
  status: 'beta',
  description: 'Full-page not-found state: code, message, a primary way home, Go back and a support link. The optional heading slot replaces the built-in title so PageHeader supplies the only h1; code stays above it and actions remain unchanged. In the PageHeader example set as="div", breadcrumbs={null}, meta={[]}, tabs={null}, actions={[]}, status="" and description={null}; use StatusLayout’s description once. PageHeader titleRef adds tabIndex=-1 for ref.current.focus() on route load without a Tab stop; leave slot links and actions empty to keep the primary action first in main.',
  layout: 'StatusLayout',
  blocks: ['page-header'],
};
