import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Data table',
  family: 'tables',
  status: 'beta',
  description:
    'Generic typed table: sortable headers with aria-sort, row selection with select-all and indeterminate, column visibility menu, density toggle, row actions, loading and empty states, client-side sort and pagination, optional row groups (groupBy) with rowgroup header rows, counts, keyboard-accessible collapse buttons and group selection; column resize (pointer drag or a focusable role="separator" handle with arrow keys, min/max widths, controlled columnWidths), column pinning to either edge with sticky cells (column menu or pinnedColumns), row virtualization for large datasets (aria-rowcount/aria-rowindex, works with selection and grouping), inline cell editing (text, number and select editors; Enter/F2 to edit, Enter/Tab to commit, Escape to cancel, onCellEdit can reject with an inline error) and saved views (filters, sort, visible columns, widths, pinning and grouping) with a view switcher to save as, rename, delete and reset.',
  uses: ['Table', 'Checkbox', 'Menu', 'MoreMenu', 'ToggleGroup', 'Button', 'Skeleton', 'EmptyState', 'Pagination', 'SimpleSelect', 'StatusTag', 'Input', 'Dialog'],
};
