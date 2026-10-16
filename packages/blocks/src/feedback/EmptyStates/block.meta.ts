import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Empty states',
  family: 'feedback',
  status: 'beta',
  description:
    'Four canonical empty states: first run (with checklist), no results (clear filters/search), no access (request access) and not found (optional action).',
  uses: ['EmptyState', 'Button', 'Link'],
};
