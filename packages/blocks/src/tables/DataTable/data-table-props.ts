import type { MoreMenuAction, TableDensity } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import type { ColumnWidths, PinnedColumns } from './column-sizing';
import type { DataTableColumn, DataTableGroupBy, SortState } from './data-table-utils';
import type { DataTableCellEditHandler } from './editable-cell';
import type { DataTableView } from './views';

export interface DataTableProps<T> {
  rows?: readonly T[];
  columns?: ReadonlyArray<DataTableColumn<T>>;
  /** Stable row id (defaults to `row.id`). */
  getRowId?: (row: T) => string;
  /** Row name for checkbox and menu labels (defaults to the first column's value). */
  getRowLabel?: (row: T) => string;
  /** Table name (screen-reader caption unless `showCaption`). */
  caption?: string;
  showCaption?: boolean;

  /** Row selection with a select-all header checkbox (current page). */
  selectable?: boolean;
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Rendered in the toolbar while rows are selected. */
  bulkActions?: (selectedIds: string[]) => ReactNode;
  /**
   * Shows the "N selected" text in the toolbar while rows are selected (default true). Turn it
   * off when the page renders its own count, e.g. a BulkActionBar.
   */
  selectionSummary?: boolean;

  /** Row-actions menu items. */
  rowActions?: (row: T) => Array<MoreMenuAction | 'separator'>;

  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** Rows arrive sorted (server side): headers still toggle, rows are not re-sorted. */
  manualSorting?: boolean;

  /** Client-side pagination; false shows every row. */
  paginated?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];

  /** Controlled row density. */
  density?: TableDensity;
  /** Initial density; omitted, the table follows the surrounding DensityProvider (comfortable outside one). */
  defaultDensity?: TableDensity;
  onDensityChange?: (density: TableDensity) => void;
  showDensityToggle?: boolean;
  showColumnMenu?: boolean;

  loading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  /**
   * Groups rows under header rows (a field key or a function returning the group key). Groups keep
   * the order in which their keys first appear in `rows`; sorting applies inside each group, and
   * pagination pages through the grouped rows (each header shows the group's full count).
   */
  groupBy?: DataTableGroupBy<T>;
  /** Header text of a group (default: the key, or "No group" for rows without a value). */
  groupLabel?: (key: string, rows: readonly T[]) => ReactNode;
  /** Group headers render a keyboard-accessible collapse button (default true). */
  collapsibleGroups?: boolean;
  /** Controlled collapsed group keys. */
  collapsedGroups?: readonly string[];
  /** Group keys collapsed initially. */
  defaultCollapsedGroups?: readonly string[];
  onCollapsedGroupsChange?: (keys: string[]) => void;

  /** Called when a saved view switches grouping (a field key, or `null` for none). */
  onGroupByChange?: (groupBy: string | null) => void;

  /** Controlled hidden column ids (default: columns with `defaultHidden`). */
  hiddenColumns?: readonly string[];
  onHiddenColumnsChange?: (ids: string[]) => void;

  /** Resize handles on the column headers (pointer drag, or arrow keys on the focused handle). */
  resizable?: boolean;
  /** Controlled column widths in px by column id. */
  columnWidths?: ColumnWidths;
  defaultColumnWidths?: ColumnWidths;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;

  /** Controlled pinned columns (sticky at the start or end edge while scrolling sideways). */
  pinnedColumns?: PinnedColumns;
  defaultPinnedColumns?: PinnedColumns;
  onPinnedColumnsChange?: (pinned: PinnedColumns) => void;
  /** Pin / unpin from the column menu (default true when pinning is in use: a pinned prop or callback). */
  showPinMenu?: boolean;

  /**
   * Renders only the rows in view (plus overscan) inside a scrolling body with a sticky header.
   * `'auto'` (default) turns it on above `virtualizeThreshold` rendered rows (with pagination,
   * the rows of the current page). The table exposes `aria-rowcount` and each row its
   * `aria-rowindex`; selection (select-all covers every row) and grouping keep working.
   * Limits: rows get a fixed height (`rowHeight`), so multi-line cells are clipped; a row that
   * scrolls out of view unmounts, so focus inside it (or an open inline editor) is lost; a group's
   * header row renders only while it is in view.
   */
  virtualize?: boolean | 'auto';
  virtualizeThreshold?: number;
  /** Row height in px for virtualization (default by density: 44 comfortable, 36 compact). */
  rowHeight?: number;
  /** Classes of the virtualized scroll container: its max height (default `max-h-[32rem]`). */
  virtualContainerClassName?: string;

  /**
   * Inline editing of `editable` columns. Return nothing to accept (and update `rows`), or a
   * message (or throw) to reject: the message is shown inline under the editor.
   */
  onCellEdit?: DataTableCellEditHandler<T>;

  /** Saved views (controlled). Each captures filters, sort, visible columns, widths, pinning and grouping. */
  views?: readonly DataTableView[];
  defaultViews?: readonly DataTableView[];
  onViewsChange?: (views: DataTableView[]) => void;
  activeViewId?: string | null;
  defaultActiveViewId?: string | null;
  onActiveViewChange?: (id: string | null) => void;
  /** Shows the view switcher (default: when views are in use). */
  showViewSwitcher?: boolean;
  /** Opaque filter state of the page's toolbar, saved with views. */
  filters?: unknown;
  /** Called when a view (or a reset) restores filters. */
  onFiltersChange?: (filters: unknown) => void;

  /** Left side of the toolbar (title, search, FilterBar…). */
  toolbar?: ReactNode;
  className?: string;
}
