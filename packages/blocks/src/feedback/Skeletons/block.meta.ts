import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Skeletons',
  family: 'feedback',
  status: 'beta',
  description: 'Loading placeholders for a whole page, a table and a list; each announces loading once via role="status".',
  uses: ['Skeleton'],
};
