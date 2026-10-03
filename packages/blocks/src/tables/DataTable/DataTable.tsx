import { Checkbox, cn, Table, TableCaption, TableHead, TableHeader, TableRow, type MoreMenuAction, type TableDensity } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { PaginationFooter } from '../PaginationFooter/PaginationFooter';
import { ColumnVisibilityMenu } from './column-menu';
import { DataTableBody } from './data-table-body';
import { columnAlign, paginate, selectionState, sortRows, toggleAll, toggleOne, type DataTableColumn, type SortState } from './data-table-utils';
import { DensityToggle } from './density-toggle';
import { DEPLOYMENT_COLUMNS, DEPLOYMENT_ROWS } from './fixtures';

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

  density?: TableDensity;
  defaultDensity?: TableDensity;
  onDensityChange?: (density: TableDensity) => void;
  showDensityToggle?: boolean;
  showColumnMenu?: boolean;

  loading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  /** Left side of the toolbar (title, search, FilterBar…). */
  toolbar?: ReactNode;
  className?: string;
}

const defaultRowId = (row: unknown): string => {
  const id = (row as { id?: unknown }).id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
};

/**
 * Generic data table on the kit Table: typed columns, sortable headers (aria-sort), row selection
 * with select-all / indeterminate, column visibility menu, density toggle, row actions, loading
 * and empty states, and client-side sort + pagination.
 */
export function DataTable<T = (typeof DEPLOYMENT_ROWS)[number]>({
  rows = DEPLOYMENT_ROWS as unknown as readonly T[],
  columns = DEPLOYMENT_COLUMNS as unknown as ReadonlyArray<DataTableColumn<T>>,
  getRowId = defaultRowId,
  getRowLabel,
  caption = 'Deployments',
  showCaption = false,
  selectable = true,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  bulkActions,
  selectionSummary = true,
  rowActions,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manualSorting = false,
  paginated = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  density: densityProp,
  defaultDensity = 'comfortable',
  onDensityChange,
  showDensityToggle = true,
  showColumnMenu = true,
  loading = false,
  loadingRows = 5,
  emptyState,
  toolbar,
  className,
}: DataTableProps<T>) {
  const [innerSort, setInnerSort] = useState<SortState | null>(defaultSort);
  const [innerSelected, setInnerSelected] = useState<ReadonlySet<string>>(() => new Set(defaultSelectedIds));
  const [innerDensity, setInnerDensity] = useState<TableDensity>(defaultDensity);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const sort = sortProp === undefined ? innerSort : sortProp;
  const selected: ReadonlySet<string> = selectedIds ? new Set(selectedIds) : innerSelected;
  const density = densityProp ?? innerDensity;
  const visibleColumns = columns.filter((c) => !hidden.has(c.id));
  const labelOf =
    getRowLabel ??
    ((row: T) => {
      const first = columns[0];
      const value = first?.accessor?.(row);
      return value == null ? getRowId(row) : String(value);
    });

  const sorted = manualSorting ? [...rows] : sortRows(rows, columns, sort);
  const pageRows = paginated ? paginate(sorted, page, pageSize) : sorted;
  const pageIds = pageRows.map(getRowId);
  const header = selectionState(pageIds, selected);
  const selectedList = rows.map(getRowId).filter((id) => selected.has(id));

  const setSelected = (next: Set<string>) => {
    setInnerSelected(next);
    onSelectionChange?.(rows.map(getRowId).filter((id) => next.has(id)));
  };
  const changeSort = (columnId: string, direction: SortState['direction']) => {
    const next: SortState = { columnId, direction: sort?.columnId === columnId ? direction : 'ascending' };
    setInnerSort(next);
    onSortChange?.(next);
    setPage(1);
  };
  const changeDensity = (next: TableDensity) => {
    setInnerDensity(next);
    onDensityChange?.(next);
  };
  const toggleColumn = (id: string, visible: boolean) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(id);
      else next.add(id);
      return next;
    });

  const hasSelection = selectable && selectedList.length > 0 && (selectionSummary || bulkActions != null);
  const showToolbar = toolbar != null || showDensityToggle || showColumnMenu || hasSelection;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-card shadow-sm', className)}>
      {showToolbar && (
        <div
          className={cn(
            'flex min-h-12 flex-wrap items-center gap-2 border-b border-border px-3 py-2 transition-colors motion-reduce:transition-none',
            hasSelection ? 'bg-primary/8' : 'bg-secondary/30',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {hasSelection ? (
              <>
                {selectionSummary && (
                  <span className="text-[12.5px] font-semibold text-foreground" aria-live="polite">
                    {selectedList.length} selected
                  </span>
                )}
                {selectionSummary && bulkActions && <span aria-hidden className="h-4 w-px bg-border" />}
                {bulkActions?.(selectedList)}
              </>
            ) : (
              toolbar
            )}
          </div>
          <div className="flex items-center gap-2">
            {showDensityToggle && <DensityToggle value={density} onChange={changeDensity} />}
            {showColumnMenu && <ColumnVisibilityMenu columns={columns} hidden={hidden} onToggle={toggleColumn} />}
          </div>
        </div>
      )}
      <Table density={density} aria-busy={loading || undefined}>
        <TableCaption srOnly={!showCaption}>{caption}</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-10 pr-0">
                <Checkbox
                  aria-label="Select all rows on this page"
                  checked={header.checked}
                  indeterminate={header.indeterminate}
                  disabled={loading || pageIds.length === 0}
                  onCheckedChange={() => setSelected(toggleAll(pageIds, selected))}
                />
              </TableHead>
            )}
            {visibleColumns.map((c) => (
              <TableHead
                key={c.id}
                align={columnAlign(c)}
                className={c.headClassName}
                sortable={c.sortable}
                sortDirection={sort?.columnId === c.id ? sort.direction : 'none'}
                onSortChange={(dir) => changeSort(c.id, dir)}
              >
                {c.header}
              </TableHead>
            ))}
            {rowActions && (
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <DataTableBody
          rows={pageRows}
          columns={visibleColumns}
          getRowId={getRowId}
          getRowLabel={labelOf}
          selectable={selectable}
          selected={selected}
          onToggleRow={(id) => setSelected(toggleOne(id, selected))}
          rowActions={rowActions}
          loading={loading}
          loadingRows={loadingRows}
          emptyState={emptyState}
        />
      </Table>
      {loading && (
        <p role="status" className="sr-only">
          Loading {caption.toLowerCase()}…
        </p>
      )}
      {paginated && !loading && rows.length > 0 && (
        <PaginationFooter
          className="border-t border-border px-4 py-3"
          total={rows.length}
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={pageSizeOptions}
          noun={caption}
        />
      )}
    </div>
  );
}
