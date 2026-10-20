import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Month calendar',
  family: 'scheduling',
  status: 'beta',
  description:
    'Locale-first month grid of scheduled work with per-day event lines, today/selected states, month navigation and full grid keyboard support. weekStartsOn and hourCycle override provider/runtime defaults; data-weekend marks locale weekends without styling. Locale examples show en-US, es-ES, then en-US with Monday-first and 24-hour overrides.',
  // Locale examples compare en-US, es-ES, and en-US with explicit overrides.
  uses: ['Button', 'IconButton'],
};
