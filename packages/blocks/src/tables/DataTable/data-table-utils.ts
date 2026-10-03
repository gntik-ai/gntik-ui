import type { ReactNode } from 'react';

export type SortDirectionValue = 'ascending' | 'descending';
export type CellValue = string | number | boolean | Date | null | undefined;

export type DataTableColumnVariant = 'default' | 'mono' | 'muted' | 'numeric';

/** Body-cell classes of each column variant. */
export const COLUMN_VARIANT_CLASSES: Record<DataTableColumnVariant, string> = {
  default: '',
  mono: 'font-mono text-[12px]',
  muted: 'text-[12.5px] text-muted-foreground',
  numeric: 'font-mono text-[12.5px] tabular-nums',
};

/** Effective alignment of a column (numeric columns default to right). */
export function columnAlign<T>(column: DataTableColumn<T>): DataTableColumn<T>['align'] {
  return column.align ?? (column.variant === 'numeric' ? 'right' : undefined);
}

/** One typed column of a DataTable. */
export interface DataTableColumn<T> {
  /** Stable key (sorting, visibility). */
  id: string;
  /** Header text; also the column's name in the visibility menu. */
  header: string;
  /** Raw value: used to sort, and rendered when `cell` is absent. */
  accessor?: (row: T) => CellValue;
  /** Custom cell rendering. */
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  /** Can be hidden from the column menu (default true). */
  hideable?: boolean;
  /** Hidden until turned on in the column menu. */
  defaultHidden?: boolean;
  /**
   * Presentational preset for the body cells: `mono` (monospace ids, regions), `muted`
   * (secondary text), `numeric` (monospace tabular figures, right-aligned unless `align` is set).
   */
  variant?: DataTableColumnVariant;
  /** Classes for the body cells (merged after the variant's). */
  className?: string;
  /** Classes for the header cell (e.g. a width). */
  headClassName?: string;
}

export interface SortState {
  columnId: string;
  direction: SortDirectionValue;
}

/** Compares two cell values: nulls last, numbers and dates numerically, strings with localeCompare (numeric). */
export function compareValues(a: CellValue, b: CellValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  const na = a instanceof Date ? a.getTime() : a;
  const nb = b instanceof Date ? b.getTime() : b;
  if (typeof na === 'number' && typeof nb === 'number') return na - nb;
  if (typeof na === 'boolean' && typeof nb === 'boolean') return Number(na) - Number(nb);
  return String(na).localeCompare(String(nb), undefined, { numeric: true, sensitivity: 'base' });
}

/** Client-side sort (stable). Returns the input order when there is no sort or the column has no accessor. */
export function sortRows<T>(rows: readonly T[], columns: ReadonlyArray<DataTableColumn<T>>, sort: SortState | null): T[] {
  const column = sort ? columns.find((c) => c.id === sort.columnId) : undefined;
  if (!sort || !column?.accessor) return [...rows];
  const get = column.accessor;
  const sign = sort.direction === 'ascending' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((x, y) => {
      const va = get(x.row);
      const vb = get(y.row);
      // Nulls stay last in both directions.
      if (va == null || vb == null) return compareValues(va, vb) || x.index - y.index;
      return sign * compareValues(va, vb) || x.index - y.index;
    })
    .map(({ row }) => row);
}

/** Number of pages for a row count (at least 1). */
export function pageCountOf(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
}

/** Client-side pagination: the rows of a 1-based page (clamped to the valid range). */
export function paginate<T>(rows: readonly T[], page: number, pageSize: number): T[] {
  const last = pageCountOf(rows.length, pageSize);
  const p = Math.min(Math.max(1, page), last);
  return rows.slice((p - 1) * pageSize, p * pageSize);
}

/** Header checkbox state for the rows on screen. */
export function selectionState(visibleIds: readonly string[], selected: ReadonlySet<string>): { checked: boolean; indeterminate: boolean } {
  const count = visibleIds.filter((id) => selected.has(id)).length;
  return { checked: count > 0 && count === visibleIds.length, indeterminate: count > 0 && count < visibleIds.length };
}

/** Selects all of `ids` when not all are selected; otherwise clears them. Other selections are kept. */
export function toggleAll(ids: readonly string[], selected: ReadonlySet<string>): Set<string> {
  const next = new Set(selected);
  const all = ids.length > 0 && ids.every((id) => selected.has(id));
  for (const id of ids) {
    if (all) next.delete(id);
    else next.add(id);
  }
  return next;
}

export function toggleOne(id: string, selected: ReadonlySet<string>): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** Default cell text for a raw value. */
export function formatCell(value: CellValue): ReactNode {
  if (value == null) return '—';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value;
}

/** Groups rows by a field key or by a function returning the group key. */
export type DataTableGroupBy<T> = Extract<keyof T, string> | ((row: T) => string | number | null | undefined);

/** One group of rows, in display order. */
export interface DataTableGroup<T> {
  /** Group key (`''` for rows without a value). */
  key: string;
  rows: T[];
}

/** Group key of a row (`''` when the value is null or undefined). */
export function groupKeyOf<T>(row: T, groupBy: DataTableGroupBy<T>): string {
  const value = typeof groupBy === 'function' ? groupBy(row) : (row as Record<string, unknown>)[groupBy];
  return value == null ? '' : String(value);
}

/**
 * Splits rows into groups, keeping the row order inside each group. Groups follow `order` (the
 * keys' first appearance in it, e.g. the unsorted input) and then any key not seen there.
 */
export function groupRows<T>(rows: readonly T[], groupBy: DataTableGroupBy<T>, order: readonly T[] = rows): DataTableGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const row of order) {
    const key = groupKeyOf(row, groupBy);
    if (!groups.has(key)) groups.set(key, []);
  }
  for (const row of rows) {
    const key = groupKeyOf(row, groupBy);
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }
  return [...groups].filter(([, list]) => list.length > 0).map(([key, list]) => ({ key, rows: list }));
}
