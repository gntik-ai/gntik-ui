import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Page toolbar',
  family: 'page-chrome',
  status: 'beta',
  description:
    'Toolbar above a list or table: search, a filters slot, a view toggle and the primary action, with roving focus. searchDebounceMs (default 0, a call per keystroke) delays onSearchChange until typing pauses; the input shows each keystroke at once, and Enter, an emptied input and unmount report at once, while a controlled search changed from outside replaces the draft.',
  uses: ['Toolbar', 'ToolbarInput', 'ToolbarButton', 'ToggleGroup', 'Toggle'],
};
