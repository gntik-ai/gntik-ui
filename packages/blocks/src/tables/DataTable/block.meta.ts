import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Data table',
  family: 'tables',
  status: 'beta',
  description:
    'Generic typed table: sortable headers with aria-sort, row selection with select-all and indeterminate, column visibility menu, density toggle, row actions, loading and empty states, client-side sort and pagination, and optional row groups (groupBy) with rowgroup header rows, counts, keyboard-accessible collapse buttons and group selection.',
  uses: ['Table', 'Checkbox', 'Menu', 'MoreMenu', 'ToggleGroup', 'Button', 'Skeleton', 'EmptyState', 'Pagination', 'SimpleSelect', 'StatusTag'],
};
