import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Week calendar',
  family: 'scheduling',
  status: 'beta',
  description:
    'Locale-first seven-day time grid with positioned events (overlaps side by side), a now line, week navigation and optional clickable events. weekStartsOn and hourCycle override provider/runtime defaults; data-weekend marks locale weekends without styling. Locale examples show en-US, es-ES, then en-US with Monday-first and 24-hour overrides.',
  // Locale examples compare en-US, es-ES, and en-US with explicit overrides.
  uses: ['Button', 'IconButton'],
};
