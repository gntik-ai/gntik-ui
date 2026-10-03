import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Global search',
  family: 'shell',
  status: 'beta',
  description: '⌘K search button opening a CommandPalette pre-wired with recent items and grouped results: pages, records and actions.',
  uses: ['CommandPalette', 'CommandPaletteTrigger', 'Kbd'],
};
