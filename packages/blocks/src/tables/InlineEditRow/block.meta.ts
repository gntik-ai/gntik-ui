import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Inline edit row',
  family: 'tables',
  status: 'beta',
  description: 'A table row that switches into edit mode with inputs, Save and Cancel; Enter saves, Escape cancels and focus returns to Edit. InlineEditTable is a ready-made editable table.',
  uses: ['Table', 'Input', 'IconButton'],
};
