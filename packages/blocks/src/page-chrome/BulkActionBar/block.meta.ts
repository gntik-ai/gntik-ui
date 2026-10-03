import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Bulk action bar',
  family: 'page-chrome',
  status: 'beta',
  description: 'Toolbar that appears while table rows are selected: selection count, bulk actions and clear selection.',
  uses: ['Toolbar', 'ToolbarButton'],
};
