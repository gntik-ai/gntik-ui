import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Global search',
  family: 'shell',
  status: 'beta',
  description:
    '⌘K search button opening a CommandPalette pre-wired with recent items and grouped results: pages, records and actions. loadItems (with debounceMs, minQueryLength and onQueryChange) adds debounced, abortable server results that onSelect reports as records, and a store from createCommandPaletteStore opens it from code. Preview: global-search--server-search.',
  uses: ['CommandPalette', 'CommandPaletteTrigger', 'Kbd'],
};
