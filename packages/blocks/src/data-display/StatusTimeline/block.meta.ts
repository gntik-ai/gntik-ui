import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Status timeline',
  family: 'data-display',
  status: 'beta',
  description: 'Vertical timeline of state changes with a StatusDot per state, details, actor and Timestamp; collapses older events.',
  uses: ['StatusDot', 'Timestamp', 'Button'],
};
