import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Activity feed',
  family: 'data-display',
  status: 'beta',
  description: 'Who did what, when: actor avatar, action, target and Timestamp, grouped by day (Today, Yesterday, date), with optional Load more.',
  uses: ['Avatar', 'Timestamp', 'Button'],
};
