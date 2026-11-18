import type { QueryCondition } from '@gntik-ai/ui';
import { HeaderFilter } from './header-filter';
import type { DataTableFilterValue } from './data-table-utils';
import { ArrowDown, ArrowUp, ChevronsUpDown } from '@gntik-ai/icons';
import { cn, InfoTip, nextSortDirection, TableHead, tableVariants, type SortDirection } from '@gntik-ai/ui';
import { stickyTint, type CellLayout } from './column-sizing';
import { columnAlign, type DataTableColumn } from './data-table-utils';
import type { DataTableLabels } from './labels';
import { ColumnResizeHandle } from './resize-handle';

export interface DataTableHeadCellProps<T> {
  labels?: Partial<DataTableLabels>;
  column: DataTableColumn<T>;
  filterCondition?: QueryCondition;
  onFilterApply?: (value: DataTableFilterValue | null) => void;
  sortDirection: SortDirection;
  onSortChange: (direction: Exclude<SortDirection, 'none'>) => void;
  layout?: CellLayout;
  /** Resize handle props; omitted, the column is not resizable. */
  resize?: { width: number; min: number; max: number; onResize: (width: number) => void };
}

/**
 * Column header of the DataTable. With help or resizing, the label and interactive controls
 * sit side by side so the info button and resize handle never nest inside the sort button.
 */
export function DataTableHeadCell<T>({
  column,
  filterCondition,
  onFilterApply,
  sortDirection,
  onSortChange,
  layout,
  resize,
  labels,
}: DataTableHeadCellProps<T>) {
  const align = columnAlign(column);
  const hasDescription = column.description != null;
  const headerName = hasDescription || column.renderHeader ? column.header : undefined;
  const label = column.renderHeader ? column.renderHeader() : column.header;
  const pinnedClass = layout?.pinned
    ? cn(layout.className, 'z-sticky-pinned', stickyTint(layout, { head: true }), 'bg-card')
    : undefined;
  if (!resize && !hasDescription && !column.filter) {
    return (
      <TableHead
        aria-label={headerName}
        align={align}
        className={cn(column.headClassName, pinnedClass)}
        style={layout?.style}
        sortable={column.sortable}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        data-column-id={column.id}
      >
        {label}
      </TableHead>
    );
  }
  const v = tableVariants({ align: align ?? 'left', active: sortDirection !== 'none' });
  const SortIcon =
    sortDirection === 'ascending' ? ArrowUp : sortDirection === 'descending' ? ArrowDown : ChevronsUpDown;
  const hasControls = hasDescription || column.filter != null;
  const HeaderContent = hasControls ? 'div' : 'span';
  const resizeHandle = resize && (
    <ColumnResizeHandle
      labels={labels}
      label={column.header}
      width={resize.width}
      min={resize.min}
      max={resize.max}
      onResize={resize.onResize}
    />
  );
  return (
    <TableHead
      aria-label={headerName}
      align={align}
      className={cn('relative overflow-visible', column.headClassName, pinnedClass)}
      style={layout?.style}
      aria-sort={column.sortable ? sortDirection : undefined}
      data-column-id={column.id}
      data-filtered={filterCondition ? '' : undefined}
    >
      <HeaderContent
        className={cn(
          hasControls ? 'flex min-w-0 items-center gap-1 pe-2' : 'block min-w-0 truncate pe-2',
          align === 'right' && (hasControls ? 'justify-end' : 'text-end'),
          align === 'center' && (hasControls ? 'justify-center' : 'text-center'),
        )}
      >
        {column.sortable ? (
          <button
            type="button"
            className={cn(v.sortButton(), 'max-w-full', hasControls && 'min-w-0')}
            onClick={() => onSortChange(nextSortDirection(sortDirection))}
          >
            <span className="truncate">{label}</span>
            <SortIcon size={13} aria-hidden className={sortDirection === 'none' ? 'opacity-40' : undefined} />
          </button>
        ) : hasDescription ? (
          <span className="min-w-0 truncate">{label}</span>
        ) : (
          label
        )}
        {hasDescription && (
          <InfoTip size="sm" label={column.header}>
            {column.description}
          </InfoTip>
        )}
        {column.filter && onFilterApply && (
          <HeaderFilter
            header={column.header}
            filter={column.filter}
            condition={filterCondition}
            onApply={onFilterApply}
            labels={labels}
          />
        )}
        {hasControls && resizeHandle}
      </HeaderContent>
      {!hasControls && resizeHandle}
    </TableHead>
  );
}
