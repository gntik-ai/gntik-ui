import type { MoreMenuAction, QueryGroup, TableDensity } from '@gntik-ai/ui';
import type { MouseEvent, ReactNode, Ref } from 'react';
import type { DataTableHandle } from './use-scroll-to-row';
import type { ColumnWidths, PinnedColumns } from './column-sizing';
import type { DataTableColumn, DataTableGroupBy, DataTableSelectionModel, SortState } from './data-table-utils';
import type { DataTableCellEditHandler } from './editable-cell';
import type { DataTableLabels } from './labels';
import type { DataTableView } from './views';
import type {
  DataTableRowEdit,
  DataTableRowSaveResult,
  DataTableRowsSaveResult,
  DataTableEditValue,
} from './row-edit-types';

/** Complete next query, emitted synchronously once per user action in either pagination mode. */
export interface DataTableQuery {
  page: number;
  pageSize: number;
  sort: SortState | null;
  filters: unknown;
  filterModel?: QueryGroup;
  /** The applied quick filter term; present while it is not empty, and as `''` when a request clears it. */
  quickFilter?: string;
  cause: 'page' | 'pageSize' | 'sort' | 'view' | 'filter' | 'quickFilter';
}

export interface DataTableCsvExportOptions {
  fileName?: string;
  scopes?: Array<'rows' | 'page' | 'selected'>;
}

export interface DataTableExportRequest {
  scope: 'rows' | 'page' | 'selected';
  columns: string[];
  selectedIds: string[];
  sort: SortState | null;
  filters: unknown;
}

interface DataTableCommonProps<T> {
  ref?: Ref<DataTableHandle>;
  /** Opt-in CSV menu. Values are raw, with spreadsheet formula protection. */
  csvExport?: boolean | DataTableCsvExportOptions;
  /** Delegate exports to the consumer; required for server pagination. */
  onExport?: (request: DataTableExportRequest) => void | Promise<void>;
  /** Per-key overrides; omitted keys keep existing defaults and provider translations. */
  labels?: Partial<DataTableLabels>;
  rows?: readonly T[];
  columns?: ReadonlyArray<DataTableColumn<T>>;
  /** Stable row id (defaults to `row.id`). */
  getRowId?: (row: T) => string;
  /** Destination activated through the non-editable identifying column link. Undefined destinations stay inert. */
  getRowHref?: (row: T) => string | undefined;
  /** Row/header activation, including modifier clicks; preventDefault cancels href navigation. */
  onRowClick?: (row: T, event: MouseEvent<HTMLElement>) => void;
  /** Pointer accelerator: provide another accessible path through the link, callback or actions. */
  onRowDoubleClick?: (row: T, event: MouseEvent<HTMLTableRowElement>) => void;
  /** Toggle the selection control on plain row clicks. Takes precedence over detail clicks. Ignored with getRowHref or onRowClick. */
  selectOnRowClick?: boolean;
  /** Row name for selection and menu labels (defaults to the first column's value). */
  getRowLabel?: (row: T) => string;
  /** Table name (screen-reader caption unless `showCaption`). */
  caption?: string;
  showCaption?: boolean;

  /** Row selection with a select-all header checkbox (current page). */
  selectable?: boolean;
  /** Native radio name in single mode. Supplied names must be unique per page. */
  selectionName?: string;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedIdChange?: (id: string) => void;
  isRowDisabled?: (row: T) => boolean;
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Keep ids absent from rows. Defaults to true for server pagination, false for client pagination. */
  preserveSelection?: boolean;
  /** Offer to extend a selected page to all matching rows (default false). */
  selectAllMatching?: boolean;
  /** Hide the page select-all checkbox, retaining row controls and the column heading. */
  hideSelectAll?: boolean;
  /** Controlled model; takes precedence over selectedIds. */
  selectionModel?: DataTableSelectionModel;
  /** Required to offer select-all-matching with server pagination. */
  onSelectionModelChange?: (model: DataTableSelectionModel) => void;
  /** Rendered in the toolbar while rows are selected. */
  bulkActions?: (selectedIds: string[], selection: DataTableSelectionModel) => ReactNode;
  /**
   * Shows the "N selected" text in the toolbar while rows are selected (default true). Turn it
   * off when the page renders its own count, e.g. a BulkActionBar.
   */
  selectionSummary?: boolean;

  /** Opt-in full-width panel. Called only while an eligible row is expanded; disables virtualization. */
  renderDetail?: (row: T) => ReactNode;
  /** Whether a row can expand (default: every row). Ineligible rows retain an empty toggle cell. */
  hasDetail?: (row: T) => boolean;
  /** Controlled detail ids; requests do not update the DOM until this prop changes. */
  expandedDetailIds?: readonly string[];
  /** Initially expanded detail ids; retained across pages and sorting. */
  defaultExpandedDetailIds?: readonly string[];
  /** Requests the next expanded detail ids. */
  onExpandedDetailIdsChange?: (ids: string[]) => void;
  /** Opening a row replaces other ids in single mode (default: multiple). */
  detailExpandMode?: 'single' | 'multiple';
  /** Toggle on plain row content clicks, excluding interactive descendants (default: false). */
  detailOnRowClick?: boolean;

  /** Row-actions menu items. */
  rowActions?: (row: T) => Array<MoreMenuAction | 'separator'>;

  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** Use this OR the separate callbacks for fetching, to avoid duplicate requests. Prop changes do not emit queries. */
  onQueryChange?: (query: DataTableQuery) => void;
  /** Rows arrive sorted (server side): headers still toggle, rows are not re-sorted. */
  manualSorting?: boolean;

  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];

  /** Controlled row density. */
  density?: TableDensity;
  /** Initial density; omitted, the table follows the surrounding DensityProvider (comfortable outside one). */
  defaultDensity?: TableDensity;
  onDensityChange?: (density: TableDensity) => void;
  showDensityToggle?: boolean;
  showColumnMenu?: boolean;

  /**
   * `true` replaces the rows with skeleton rows and hides the footer. `'refresh'` keeps the current
   * rows, selection, virtualization and footer, sets `aria-busy` and overlays an indeterminate
   * progress bar on the top of the body; with no rows it behaves like `true`. A refresh that follows a
   * page, page-size, sort, filter or view request the table emitted is announced politely; one the
   * caller starts alone (a poll) is not.
   */
  loading?: boolean | 'refresh';
  loadingRows?: number;
  emptyState?: ReactNode;
  /** Shown instead of `emptyState` when there are no rows and `filtered` is true. */
  noResultsState?: ReactNode;
  /** The empty result comes from a search or filter, so `noResultsState` applies (default false). */
  filtered?: boolean;
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
  /** Opt-in whole-row editing; cell mode remains the default. */
  editMode?: 'cell' | 'row';
  onRowAdd?: (values: Record<string, DataTableEditValue>) => DataTableRowSaveResult | Promise<DataTableRowSaveResult>;
  newRowPosition?: 'top' | 'bottom';
  newRowDefaults?: () => Record<string, DataTableEditValue>;
  onRowDelete?: (row: T) => void | Promise<void>;
  editingRowIds?: readonly string[];
  defaultEditingRowIds?: readonly string[];
  onEditingRowIdsChange?: (ids: string[]) => void;
  onRowsSave?: (edits: DataTableRowEdit<T>[]) => DataTableRowsSaveResult | Promise<DataTableRowsSaveResult>;
  onRowSave?: (edit: DataTableRowEdit<T>) => DataTableRowSaveResult | Promise<DataTableRowSaveResult>;

  /** Saved views (controlled). Each captures filters, sort, visible columns, widths, pinning and grouping. */
  views?: readonly DataTableView[];
  defaultViews?: readonly DataTableView[];
  onViewsChange?: (views: DataTableView[]) => void;
  activeViewId?: string | null;
  defaultActiveViewId?: string | null;
  onActiveViewChange?: (id: string | null) => void;
  /** Shows the view switcher (default: when views are in use). */
  showViewSwitcher?: boolean;
  /** Typed header/query filters, controlled when supplied. */
  filterModel?: QueryGroup;
  /** Initial model and fallback for saved views without a model. */
  defaultFilterModel?: QueryGroup;
  onFilterModelChange?: (model: QueryGroup) => void;
  /** Opaque filter state of the page's toolbar, saved with views. */
  filters?: unknown;
  /** Called when a view (or a reset) restores filters. */
  onFiltersChange?: (filters: unknown) => void;

  /**
   * Quick filter term: rows are kept when every whitespace-separated term matches a searchable column
   * (see `DataTableColumn.quickFilter`), ignoring case and accents. Client mode filters `rows`; server
   * mode never does and only reports the term. Changing the prop emits no query.
   */
  quickFilter?: string;
  /** Initial uncontrolled term (default ''). */
  defaultQuickFilter?: string;
  /** Called with each applied term: after the debounce, on Enter and on clear. */
  onQuickFilterChange?: (value: string) => void;
  /**
   * Renders a search field at the start of the toolbar that stays mounted while rows are selected.
   * `'collapsible'` starts as a search button that expands the field; a non-empty term keeps it open.
   */
  showQuickFilter?: boolean | 'collapsible';
  /** Milliseconds after the last keystroke before the built-in field applies its text (default 300). */
  quickFilterDebounceMs?: number;

  /** Left side of the toolbar (title, search, FilterBar…). */
  toolbar?: ReactNode;
  className?: string;
}

interface ClientPaginationProps {
  paginationMode?: 'client';
  rowCount?: never;
  /** Current client page, 1-based (controlled); pair with onPageChange. */
  page?: number;
  /** Initial uncontrolled client page (default 1). */
  defaultPage?: number;
  /** Requests a client page; controlled tables wait for the page prop to change. */
  onPageChange?: (page: number) => void;
  /** Controlled client rows per page; pair with onPageSizeChange. */
  pageSize?: number;
  /** Requests a size; may also request the page retaining the first visible row. */
  onPageSizeChange?: (size: number) => void;
  /** Fit whole rows to a definite parent height (default false). Owns page size and hides its select. */
  autoPageSize?: boolean;
}

interface ServerPaginationProps {
  defaultPage?: never;
  autoPageSize?: never;
  /** Rows arrive as one server page without client sorting or slicing. Sortable headers require onSortChange or onQueryChange; sorting requests page 1. */
  paginationMode: 'server';
  /** Total number of rows across all pages; required even for an empty result. */
  rowCount: number;
  /** Current page, 1-based. Out-of-range pages are clamped for display without callbacks. */
  page: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  /** The footer may also request a page change to keep the first visible row on screen. */
  onPageSizeChange?: (size: number) => void;
}

export type DataTableProps<T> = DataTableCommonProps<T> &
  (
    | ({
        selectionMode: 'single';
        paginated?: boolean;
        /** Consumer-supplied accessible group label; the kit adds no default. */
        legend?: ReactNode;
        'aria-label'?: string;
        'aria-labelledby'?: string;
      } & (ClientPaginationProps | ServerPaginationProps))
    | ({
        selectionMode?: 'none' | 'multiple';
        paginated?: boolean;
        legend?: never;
        'aria-label'?: never;
        'aria-labelledby'?: never;
      } & (ClientPaginationProps | ServerPaginationProps))
  );
