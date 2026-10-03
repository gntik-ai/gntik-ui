import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Empty states',
  family: 'feedback',
  status: 'beta',
  description: 'Three canonical empty states: first run (with checklist), no results (clear filters/search) and no access (request access).',
  uses: ['EmptyState', 'Button', 'Link'],
};
