import { ArrowDown, ArrowUp, ChevronsUpDown } from '@gntik-ai/icons';
import { cn, nextSortDirection, TableHead, tableVariants, type SortDirection } from '@gntik-ai/ui';
import { stickyTint, type CellLayout } from './column-sizing';
import { columnAlign, type DataTableColumn } from './data-table-utils';
import { ColumnResizeHandle } from './resize-handle';

export interface DataTableHeadCellProps<T> {
  column: DataTableColumn<T>;
  sortDirection: SortDirection;
  onSortChange: (direction: Exclude<SortDirection, 'none'>) => void;
  layout?: CellLayout;
  /** Resize handle props; omitted, the column is not resizable. */
  resize?: { width: number; min: number; max: number; onResize: (width: number) => void };
}

/**
 * Column header of the DataTable. Without a resize handle it is the kit TableHead; with one, the
 * sort button and the handle sit side by side (the handle never nests inside the button).
 */
export function DataTableHeadCell<T>({ column, sortDirection, onSortChange, layout, resize }: DataTableHeadCellProps<T>) {
  const align = columnAlign(column);
  const pinnedClass = layout?.pinned ? cn(layout.className, 'z-[11]', stickyTint(layout, { head: true }), 'bg-card') : undefined;
  if (!resize) {
    return (
      <TableHead
        align={align}
        className={cn(column.headClassName, pinnedClass)}
        style={layout?.style}
        sortable={column.sortable}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        data-column-id={column.id}
      >
        {column.header}
      </TableHead>
    );
  }
  const v = tableVariants({ align: align ?? 'left', active: sortDirection !== 'none' });
  const SortIcon = sortDirection === 'ascending' ? ArrowUp : sortDirection === 'descending' ? ArrowDown : ChevronsUpDown;
  return (
    <TableHead
      align={align}
      className={cn('relative overflow-visible', column.headClassName, pinnedClass)}
      style={layout?.style}
      aria-sort={column.sortable ? sortDirection : undefined}
      data-column-id={column.id}
    >
      <span className={cn('block min-w-0 truncate pe-2', align === 'right' && 'text-end', align === 'center' && 'text-center')}>
        {column.sortable ? (
          <button type="button" className={cn(v.sortButton(), 'max-w-full')} onClick={() => onSortChange(nextSortDirection(sortDirection))}>
            <span className="truncate">{column.header}</span>
            <SortIcon size={13} aria-hidden className={sortDirection === 'none' ? 'opacity-40' : undefined} />
          </button>
        ) : (
          column.header
        )}
      </span>
      <ColumnResizeHandle label={column.header} width={resize.width} min={resize.min} max={resize.max} onResize={resize.onResize} />
    </TableHead>
  );
}
