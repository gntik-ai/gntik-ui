import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Data table',
  family: 'tables',
  status: 'beta',
  description:
    'Generic typed table: sortable headers with aria-sort, row selection with select-all and indeterminate by default (selectionMode="multiple"), selectionMode="none" to hide selection, and opt-in selectionMode="single" with native radios in a labelled fieldset (never paginated or virtualized; paginated defaults to false and paginated=true is a type error). Single mode uses selectedId/onSelectedIdChange or defaultSelectedId; isRowDisabled skips unavailable rows and preserves a checked disabled choice without callbacks. Supply legend, aria-label or aria-labelledby for the group and getRowLabel for each radio (otherwise the first column labels it). selectionName is used verbatim and must be unique per page; omitted names use an instance-unique useId name, and duplicate supplied names or missing group labels warn in development. Tab enters once on the checked enabled row or first enabled row; arrows wrap and skip disabled rows, Space selects, Shift+Tab exits, and all-disabled groups have no tab stop. No select-all, group checkboxes, bulk actions or selection summary appear in single mode. Examples in examples/single-selection.tsx: an uncontrolled non-paginated list with legend="Available items" and a controlled versions table with legend="Available versions", selectedId="v2" and a checked disabled version, column visibility menu, density toggle, row actions, loading and empty states, client-side sort and pagination, optional row groups (groupBy) with rowgroup header rows, counts, keyboard-accessible collapse buttons and group selection; column resize (pointer drag or a focusable role="separator" handle with arrow keys, min/max widths, controlled columnWidths), column pinning to either edge with sticky cells (column menu or pinnedColumns), row virtualization for large datasets (aria-rowcount/aria-rowindex, works with selection and grouping), inline cell editing (text, number and select editors; Enter/F2 to edit, Enter/Tab to commit, Escape to cancel, onCellEdit can reject with an inline error) and saved views (filters, sort, visible columns, widths, pinning and grouping) with a view switcher to save as, rename, delete and reset.',
  uses: [
    'Table',
    'Checkbox',
    'Menu',
    'MoreMenu',
    'ToggleGroup',
    'Button',
    'Skeleton',
    'EmptyState',
    'Pagination',
    'SimpleSelect',
    'StatusTag',
    'Input',
    'Dialog',
  ],
};
