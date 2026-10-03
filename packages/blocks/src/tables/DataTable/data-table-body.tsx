import { Inbox } from '@gntik-ai/icons';
import { Checkbox, cn, EmptyState, MoreMenu, Skeleton, TableBody, TableCell, TableRow, type MoreMenuAction } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { formatCell, type DataTableColumn } from './data-table-utils';

export interface DataTableBodyProps<T> {
  rows: readonly T[];
  columns: ReadonlyArray<DataTableColumn<T>>;
  getRowId: (row: T) => string;
  /** Label of a row for its checkbox and actions ("orders-api"). */
  getRowLabel: (row: T) => string;
  selectable: boolean;
  selected: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  rowActions?: (row: T) => Array<MoreMenuAction | 'separator'>;
  loading: boolean;
  loadingRows: number;
  emptyState?: ReactNode;
}

/** Body rows, plus the loading (skeleton rows) and empty (EmptyState) states. */
export function DataTableBody<T>({
  rows,
  columns,
  getRowId,
  getRowLabel,
  selectable,
  selected,
  onToggleRow,
  rowActions,
  loading,
  loadingRows,
  emptyState,
}: DataTableBodyProps<T>) {
  const span = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  if (loading) {
    return (
      <TableBody>
        {Array.from({ length: loadingRows }, (_, i) => (
          <TableRow key={`loading-${i}`}>
            {selectable && (
              <TableCell className="w-10">
                <Skeleton className="size-4 rounded-[4px]" />
              </TableCell>
            )}
            {columns.map((c) => (
              <TableCell key={c.id} align={c.align}>
                <Skeleton className={cn('h-3.5', c.align === 'right' ? 'ml-auto w-16' : 'w-24')} />
              </TableCell>
            ))}
            {rowActions && <TableCell className="w-12" />}
          </TableRow>
        ))}
      </TableBody>
    );
  }
  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={span} className="py-10">
            {emptyState ?? <EmptyState icon={Inbox} size="sm" title="No results" description="Nothing matches the current filters." />}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  return (
    <TableBody>
      {rows.map((row) => {
        const id = getRowId(row);
        const isSelected = selected.has(id);
        const label = getRowLabel(row);
        return (
          <TableRow key={id} selected={selectable && isSelected}>
            {selectable && (
              <TableCell className="w-10 pr-0">
                <Checkbox aria-label={`Select ${label}`} checked={isSelected} onCheckedChange={() => onToggleRow(id)} />
              </TableCell>
            )}
            {columns.map((c) => (
              <TableCell key={c.id} align={c.align} className={cn('whitespace-nowrap', c.className)}>
                {c.cell ? c.cell(row) : formatCell(c.accessor?.(row))}
              </TableCell>
            ))}
            {rowActions && (
              <TableCell align="right" className="w-12 py-0">
                <MoreMenu items={rowActions(row)} label={`Actions for ${label}`} variant="ghost" size="sm" />
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </TableBody>
  );
}
