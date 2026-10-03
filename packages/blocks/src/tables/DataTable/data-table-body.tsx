import { Inbox } from '@gntik-ai/icons';
import { Checkbox, cn, EmptyState, MoreMenu, Skeleton, TableBody, TableCell, TableRow, type MoreMenuAction, useI18n } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { COLUMN_VARIANT_CLASSES, columnAlign, formatCell, type DataTableColumn } from './data-table-utils';

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
  const { t } = useI18n();
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
              <TableCell key={c.id} align={columnAlign(c)}>
                <Skeleton className={cn('h-3.5', columnAlign(c) === 'right' ? 'ms-auto w-16' : 'w-24')} />
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
            {emptyState ?? <EmptyState icon={Inbox} size="sm" title={t('common.noResults')} description={t('table.emptyDescription')} />}
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
              <TableCell className="w-10 pe-0">
                <Checkbox aria-label={t('table.selectRow', { label })} checked={isSelected} onCheckedChange={() => onToggleRow(id)} />
              </TableCell>
            )}
            {columns.map((c) => (
              <TableCell key={c.id} align={columnAlign(c)} className={cn('whitespace-nowrap', COLUMN_VARIANT_CLASSES[c.variant ?? 'default'], c.className)}>
                {c.cell ? c.cell(row) : formatCell(c.accessor?.(row))}
              </TableCell>
            ))}
            {rowActions && (
              <TableCell align="right" className="w-12 py-0">
                <MoreMenu items={rowActions(row)} label={t('table.rowActions', { label })} variant="ghost" size="sm" />
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </TableBody>
  );
}
