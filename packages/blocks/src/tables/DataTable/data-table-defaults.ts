import type { TableDensity } from '@gntik-ai/ui';
import type { ColumnWidths, PinnedColumns } from './column-sizing';
import type { DataTableColumn } from './data-table-utils';

export const EMPTY_PINNED: PinnedColumns = {};
export const EMPTY_WIDTHS: ColumnWidths = {};
export const ROW_HEIGHT: Record<TableDensity, number> = { comfortable: 44, compact: 36 };

export const defaultRowId = (row: unknown): string => {
  const id = (row as { id?: unknown }).id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
};

export function defaultRowLabel<T>(
  columns: ReadonlyArray<DataTableColumn<T>>,
  rowHeaderId: string | undefined,
  getRowId: (row: T) => string,
) {
  return (row: T) => {
    const labelColumn = columns.find((column) => column.id === rowHeaderId) ?? columns[0];
    const value = labelColumn?.accessor?.(row);
    return value == null ? getRowId(row) : String(value);
  };
}
