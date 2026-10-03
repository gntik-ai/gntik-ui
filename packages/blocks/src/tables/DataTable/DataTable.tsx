import { Checkbox, cn, DensityProvider, Table, TableCaption, TableHead, TableHeader, TableRow, type TableDensity, useDensity, useI18n } from '@gntik-ai/ui';
import { useId, useRef, useState } from 'react';
import { PaginationFooter } from '../PaginationFooter/PaginationFooter';
import { ColumnVisibilityMenu } from './column-menu';
import { clampColumnWidth, columnWidthOf, orderColumns, pinSideOf, setColumnPin, stickyTint, tableLayout, widthBounds, type ColumnWidths, type PinnedColumns } from './column-sizing';
import { DataTableBody, flattenBody, type DataTableBodyGroup } from './data-table-body';
import type { DataTableProps } from './data-table-props';
import { groupKeyOf, groupRows, paginate, selectionState, sortRows, toggleAll, toggleOne, type DataTableColumn, type DataTableGroupBy, type SortState } from './data-table-utils';
import { DensityToggle } from './density-toggle';
import { DEPLOYMENT_COLUMNS, DEPLOYMENT_ROWS } from './fixtures';
import { DataTableHeadCell } from './header-cell';
import { useControllable, useTableViews } from './use-table-views';
import { useVirtualRows } from './use-virtual-rows';
import { ViewSwitcher, type DataTableViewState } from './views';

export type { DataTableProps } from './data-table-props';

const defaultRowId = (row: unknown): string => {
  const id = (row as { id?: unknown }).id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
};
const EMPTY_PINNED: PinnedColumns = {};
const EMPTY_WIDTHS: ColumnWidths = {};
const ROW_HEIGHT: Record<TableDensity, number> = { comfortable: 44, compact: 36 };

/**
 * Generic data table on the kit Table: typed columns, sortable headers (aria-sort), row selection
 * with select-all / indeterminate, column visibility menu, density toggle, row actions, loading
 * and empty states, client-side sort + pagination, optional collapsible row groups (`groupBy`),
 * column resize and pinning, row virtualization, inline cell editing and saved views.
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
  defaultDensity,
  onDensityChange,
  showDensityToggle = true,
  showColumnMenu = true,
  loading = false,
  loadingRows = 5,
  emptyState,
  groupBy,
  groupLabel,
  collapsibleGroups = true,
  collapsedGroups: collapsedProp,
  defaultCollapsedGroups = [],
  onCollapsedGroupsChange,
  onGroupByChange,
  hiddenColumns: hiddenProp,
  onHiddenColumnsChange,
  resizable = false,
  columnWidths: widthsProp,
  defaultColumnWidths = EMPTY_WIDTHS,
  onColumnWidthsChange,
  pinnedColumns: pinnedProp,
  defaultPinnedColumns = EMPTY_PINNED,
  onPinnedColumnsChange,
  showPinMenu,
  virtualize = 'auto',
  virtualizeThreshold = 100,
  rowHeight: rowHeightProp,
  virtualContainerClassName = 'max-h-[32rem]',
  onCellEdit,
  views: viewsProp,
  defaultViews,
  onViewsChange,
  activeViewId,
  defaultActiveViewId,
  onActiveViewChange,
  showViewSwitcher,
  filters,
  onFiltersChange,
  toolbar,
  className,
}: DataTableProps<T>) {
  const { t } = useI18n();
  const editHintId = useId();
  const tableRef = useRef<HTMLTableElement>(null);
  // A view active at mount seeds the initial state.
  const [initialView] = useState(() => (viewsProp ?? defaultViews ?? []).find((v) => v.id === (activeViewId ?? defaultActiveViewId)));
  const [initialFilters] = useState(() => filters);
  const seed = initialView?.state ?? {};
  const defaultHidden = columns.filter((c) => c.defaultHidden).map((c) => c.id);

  const [innerSort, setInnerSort] = useState<SortState | null>(seed.sort !== undefined ? seed.sort : defaultSort);
  const [innerSelected, setInnerSelected] = useState<ReadonlySet<string>>(() => new Set(defaultSelectedIds));
  const [innerDensity, setInnerDensity] = useState<TableDensity | null>(defaultDensity ?? null);
  const contextDensity = useDensity();
  const [hiddenList, setHiddenList] = useControllable<readonly string[]>(hiddenProp, () => seed.hiddenColumns ?? defaultHidden, (ids) => onHiddenColumnsChange?.([...ids]));
  const [widths, setWidths] = useControllable<ColumnWidths>(widthsProp, () => seed.columnWidths ?? defaultColumnWidths, (w) => onColumnWidthsChange?.({ ...w }));
  const [pinned, setPinned] = useControllable<PinnedColumns>(pinnedProp, () => seed.pinnedColumns ?? defaultPinnedColumns, onPinnedColumnsChange);
  // `undefined`: follow the groupBy prop; a string or null: set by a saved view.
  const [groupOverride, setGroupOverride] = useState<string | null | undefined>(seed.groupBy);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const hidden: ReadonlySet<string> = new Set(hiddenList);
  const effectiveGroupBy: DataTableGroupBy<T> | undefined = groupOverride === undefined ? groupBy : ((groupOverride ?? undefined) as DataTableGroupBy<T> | undefined);
  const sort = sortProp === undefined ? innerSort : sortProp;
  const selected: ReadonlySet<string> = selectedIds ? new Set(selectedIds) : innerSelected;
  const density = densityProp ?? innerDensity ?? contextDensity;
  const visibleColumns = orderColumns(
    columns.filter((c) => !hidden.has(c.id)),
    pinned,
  );
  const labelOf =
    getRowLabel ??
    ((row: T) => {
      const first = columns[0];
      const value = first?.accessor?.(row);
      return value == null ? getRowId(row) : String(value);
    });

  const [innerCollapsed, setInnerCollapsed] = useState<ReadonlySet<string>>(() => new Set(defaultCollapsedGroups));
  const collapsed: ReadonlySet<string> = collapsedProp ? new Set(collapsedProp) : innerCollapsed;

  const sortedRows = manualSorting ? [...rows] : sortRows(rows, columns, sort);
  const allGroups = effectiveGroupBy ? groupRows(sortedRows, effectiveGroupBy, rows) : null;
  const sorted = allGroups ? allGroups.flatMap((g) => g.rows) : sortedRows;
  const pageRows = paginated ? paginate(sorted, page, pageSize) : sorted;
  // Rows in collapsed groups are hidden, so select-all leaves them alone.
  const pageIds = (effectiveGroupBy ? pageRows.filter((row) => !collapsed.has(groupKeyOf(row, effectiveGroupBy))) : pageRows).map(getRowId);
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
  const toggleGroup = (key: string) => {
    const next = new Set(collapsed);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setInnerCollapsed(next);
    onCollapsedGroupsChange?.([...next]);
  };
  const nameOf = (key: string) => key || 'No group';
  const bodyGroups: Array<DataTableBodyGroup<T>> | undefined =
    effectiveGroupBy && allGroups
      ? allGroups
          .map((g) => ({
            key: g.key,
            label: groupLabel ? groupLabel(g.key, g.rows) : nameOf(g.key),
            name: nameOf(g.key),
            rows: pageRows.filter((row) => groupKeyOf(row, effectiveGroupBy) === g.key),
            ids: g.rows.map(getRowId),
          }))
          .filter((g) => g.rows.length > 0)
      : undefined;
  const groupsForBody = bodyGroups && bodyGroups.length > 0 ? bodyGroups : undefined;

  const changeDensity = (next: TableDensity) => {
    setInnerDensity(next);
    onDensityChange?.(next);
  };
  const toggleColumn = (id: string, visible: boolean) => setHiddenList(visible ? hiddenList.filter((c) => c !== id) : [...hiddenList, id]);
  const resizeColumn = (column: DataTableColumn<T>, width: number) => setWidths({ ...widths, [column.id]: clampColumnWidth(column, width) });

  // Saved views.
  const groupName = (g: DataTableGroupBy<T> | undefined): string | null => (typeof g === 'string' ? g : null);
  const currentState: DataTableViewState = {
    filters,
    sort,
    hiddenColumns: hiddenList,
    columnWidths: widths,
    pinnedColumns: pinned,
    groupBy: groupOverride === undefined ? groupName(groupBy) : groupOverride,
  };
  const defaultState: DataTableViewState = {
    filters: initialFilters,
    sort: defaultSort,
    hiddenColumns: defaultHidden,
    columnWidths: defaultColumnWidths,
    pinnedColumns: defaultPinnedColumns,
    groupBy: groupName(groupBy),
  };
  const applyState = (state: DataTableViewState) => {
    const nextSort = state.sort ?? null;
    setInnerSort(nextSort);
    if (nextSort) onSortChange?.(nextSort);
    setHiddenList(state.hiddenColumns ?? defaultHidden);
    setWidths(state.columnWidths ?? defaultColumnWidths);
    setPinned(state.pinnedColumns ?? defaultPinnedColumns);
    const nextGroup = state.groupBy ?? null;
    setGroupOverride(nextGroup === groupName(groupBy) && typeof groupBy !== 'function' ? undefined : nextGroup);
    if (nextGroup !== currentState.groupBy) onGroupByChange?.(nextGroup);
    if (state.filters !== filters) onFiltersChange?.(state.filters);
    setPage(1);
  };
  const viewsApi = useTableViews({
    views: viewsProp,
    defaultViews,
    onViewsChange,
    activeViewId,
    defaultActiveViewId,
    onActiveViewChange,
    current: currentState,
    defaults: defaultState,
    apply: applyState,
  });
  const showViews = showViewSwitcher ?? (viewsProp != null || defaultViews != null || onViewsChange != null);

  const pinning = showPinMenu ?? (pinnedProp != null || defaultPinnedColumns !== EMPTY_PINNED || onPinnedColumnsChange != null);
  const layout = tableLayout({
    columns: visibleColumns,
    widths,
    pinned,
    sized: resizable || widthsProp != null || defaultColumnWidths !== EMPTY_WIDTHS,
    lead: selectable,
    trail: rowActions != null,
  });

  const items = loading || pageRows.length === 0 ? 0 : flattenBody(pageRows, groupsForBody, collapsed).length;
  const virtualOn = !loading && (virtualize === true || (virtualize === 'auto' && items > virtualizeThreshold));
  const rowHeight = rowHeightProp ?? ROW_HEIGHT[density];
  const virtual = useVirtualRows({ enabled: virtualOn, count: items, rowHeight, tableRef, viewportHeight: 512 });

  const hasSelection = selectable && selectedList.length > 0 && (selectionSummary || bulkActions != null);
  const showToolbar = toolbar != null || showDensityToggle || showColumnMenu || showViews || hasSelection;
  const anyEditable = onCellEdit != null && columns.some((c) => c.editable);

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
            {showViews && (
              <ViewSwitcher
                views={viewsApi.views}
                activeId={viewsApi.activeId}
                dirty={viewsApi.dirty}
                onSelect={viewsApi.select}
                onSaveAs={viewsApi.saveAs}
                onSave={viewsApi.save}
                onRename={viewsApi.rename}
                onDelete={viewsApi.remove}
                onReset={viewsApi.reset}
              />
            )}
            {showDensityToggle && <DensityToggle value={density} onChange={changeDensity} />}
            {showColumnMenu && (
              <ColumnVisibilityMenu
                columns={columns}
                hidden={hidden}
                onToggle={toggleColumn}
                pinOf={pinning ? (id) => pinSideOf(id, pinned) : undefined}
                onPin={pinning ? (id, side) => setPinned(setColumnPin(pinned, id, side)) : undefined}
              />
            )}
          </div>
        </div>
      )}
      {anyEditable && (
        <span id={editHintId} className="sr-only">
          Press Enter or F2 to edit.
        </span>
      )}
      {/* The toggle drives a density context for the table: its rows and the controls inside them. */}
      <DensityProvider density={density}>
        <Table
          ref={tableRef}
          aria-busy={loading || undefined}
          aria-rowcount={virtual ? items + 1 : undefined}
          stickyHeader={virtualOn}
          containerClassName={virtualOn ? virtualContainerClassName : undefined}
          containerLabel={virtualOn ? caption : undefined}
          className={layout.tableClassName}
          style={layout.tableStyle}
          data-virtualized={virtualOn || undefined}
        >
          <TableCaption srOnly={!showCaption}>{caption}</TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent" aria-rowindex={virtual ? 1 : undefined}>
              {selectable && (
                <TableHead
                  className={cn('w-10 pe-0', layout.lead.className, layout.lead.pinned && 'z-[11] bg-card', stickyTint(layout.lead, { head: true }))}
                  style={layout.lead.style}
                >
                  <Checkbox
                    aria-label={t('table.selectAllPage')}
                    checked={header.checked}
                    indeterminate={header.indeterminate}
                    disabled={loading || pageIds.length === 0}
                    onCheckedChange={() => setSelected(toggleAll(pageIds, selected))}
                  />
                </TableHead>
              )}
              {visibleColumns.map((c) => {
                const bounds = widthBounds(c);
                return (
                  <DataTableHeadCell
                    key={c.id}
                    column={c}
                    layout={layout.columns.get(c.id)}
                    sortDirection={sort?.columnId === c.id ? sort.direction : 'none'}
                    onSortChange={(dir) => changeSort(c.id, dir)}
                    resize={resizable && c.resizable !== false ? { width: columnWidthOf(c, widths), min: bounds.min, max: bounds.max, onResize: (w) => resizeColumn(c, w) } : undefined}
                  />
                );
              })}
              {rowActions && (
                <TableHead
                  className={cn('w-12', layout.trail.className, layout.trail.pinned && 'z-[11] bg-card', stickyTint(layout.trail, { head: true }))}
                  style={layout.trail.style}
                >
                  <span className="sr-only">{t('table.actions')}</span>
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
            groups={groupsForBody}
            collapsedGroups={collapsed}
            collapsibleGroups={collapsibleGroups}
            onToggleGroup={toggleGroup}
            onToggleGroupRows={(ids) => setSelected(toggleAll(ids, selected))}
            layout={layout}
            onCellEdit={onCellEdit}
            editHintId={anyEditable ? editHintId : undefined}
            virtual={virtual}
          />
        </Table>
      </DensityProvider>
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
