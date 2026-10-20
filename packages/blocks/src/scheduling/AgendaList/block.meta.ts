import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Agenda list',
  family: 'scheduling',
  status: 'beta',
  description:
    'Upcoming scheduled work grouped by day (Today/Tomorrow labels), each row with a kind tile, locale-formatted time range, location and kind badge; empty state included. hourCycle overrides the provider/runtime clock. Locale examples show en-US, es-ES, then en-US with the 24-hour override.',
  // Locale examples compare en-US, es-ES, and en-US with explicit overrides.
  uses: ['Badge', 'EmptyState'],
};
