import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Agenda list',
  family: 'scheduling',
  status: 'beta',
  description: 'Upcoming scheduled work grouped by day (Today/Tomorrow labels), each row with a kind tile, time range, location and kind badge; empty state included.',
  uses: ['Badge', 'EmptyState'],
};
