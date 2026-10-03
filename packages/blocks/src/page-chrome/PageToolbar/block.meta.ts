import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Page toolbar',
  family: 'page-chrome',
  status: 'beta',
  description: 'Toolbar above a list or table: search, a filters slot, a view toggle and the primary action, with roving focus.',
  uses: ['Toolbar', 'ToolbarInput', 'ToolbarButton', 'ToggleGroup', 'Toggle'],
};
