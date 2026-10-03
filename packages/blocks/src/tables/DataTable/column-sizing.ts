import type { CSSProperties } from 'react';
import type { DataTableColumn } from './data-table-utils';

/** Column widths in px by column id. */
export type ColumnWidths = Readonly<Record<string, number>>;

/** Columns pinned to the start (left in LTR) and end edges, in display order. */
export interface PinnedColumns {
  left?: readonly string[];
  right?: readonly string[];
}

export type PinSide = 'left' | 'right';

export const DEFAULT_COLUMN_WIDTH = 160;
export const MIN_COLUMN_WIDTH = 60;
export const MAX_COLUMN_WIDTH = 640;
/** Width of the selection (checkbox) and row-actions columns: `w-10` and `w-12`. */
export const LEAD_WIDTH = 40;
export const TRAIL_WIDTH = 48;

/** Width limits of a column. */
export function widthBounds<T>(column: DataTableColumn<T>): { min: number; max: number } {
  const min = column.minWidth ?? MIN_COLUMN_WIDTH;
  return { min, max: Math.max(min, column.maxWidth ?? MAX_COLUMN_WIDTH) };
}

/** Clamps a width to the column's limits (rounded to whole px). */
export function clampColumnWidth<T>(column: DataTableColumn<T>, width: number): number {
  const { min, max } = widthBounds(column);
  return Math.round(Math.min(max, Math.max(min, width)));
}

/** Effective width of a column: the widths map, then `column.width`, then the default. */
export function columnWidthOf<T>(column: DataTableColumn<T>, widths: ColumnWidths): number {
  return clampColumnWidth(column, widths[column.id] ?? column.width ?? DEFAULT_COLUMN_WIDTH);
}

export function pinSideOf(id: string, pinned: PinnedColumns): PinSide | null {
  if (pinned.left?.includes(id)) return 'left';
  if (pinned.right?.includes(id)) return 'right';
  return null;
}

/** Pins a column to a side (appended to that side) or unpins it (`null`). */
export function setColumnPin(pinned: PinnedColumns, id: string, side: PinSide | null): PinnedColumns {
  const left = (pinned.left ?? []).filter((c) => c !== id);
  const right = (pinned.right ?? []).filter((c) => c !== id);
  if (side === 'left') left.push(id);
  if (side === 'right') right.push(id);
  return { left, right };
}

/** Display order: start-pinned columns (pin order), unpinned columns (column order), end-pinned columns. */
export function orderColumns<T>(columns: ReadonlyArray<DataTableColumn<T>>, pinned: PinnedColumns): Array<DataTableColumn<T>> {
  const byId = new Map(columns.map((c) => [c.id, c]));
  const pick = (ids: readonly string[] = []) => ids.map((id) => byId.get(id)).filter((c): c is DataTableColumn<T> => c != null);
  const left = pick(pinned.left);
  const right = pick(pinned.right);
  const taken = new Set([...left, ...right].map((c) => c.id));
  return [...left, ...columns.filter((c) => !taken.has(c.id)), ...right];
}

/** Layout of one column cell: inline style (width, sticky offset) and classes. */
export interface CellLayout {
  style?: CSSProperties;
  className?: string;
  pinned?: PinSide;
}

export interface TableLayout {
  /** Layout per column id. */
  columns: ReadonlyMap<string, CellLayout>;
  /** Selection column (sticky at the start when any column is start-pinned). */
  lead: CellLayout;
  /** Row-actions column (sticky at the end when any column is end-pinned). */
  trail: CellLayout;
  /** Table classes and style (fixed layout and total width when columns are sized). */
  tableClassName?: string;
  tableStyle?: CSSProperties;
}

// Sticky cells need an opaque surface; the row tint (hover, selected) is layered under the content.
const STICKY = 'sticky z-[1] bg-card';
const START_EDGE = 'border-e border-border';
const END_EDGE = 'border-s border-border';

/**
 * Computes widths and sticky offsets. With `sized` off and nothing pinned the table keeps its
 * automatic layout (the original behaviour); otherwise it switches to a fixed layout whose width
 * is the sum of the column widths (at least the container's).
 */
export function tableLayout<T>({
  columns,
  widths,
  pinned,
  sized,
  lead,
  trail,
}: {
  columns: ReadonlyArray<DataTableColumn<T>>;
  widths: ColumnWidths;
  pinned: PinnedColumns;
  sized: boolean;
  lead: boolean;
  trail: boolean;
}): TableLayout {
  const map = new Map<string, CellLayout>();
  const hasStart = columns.some((c) => pinSideOf(c.id, pinned) === 'left');
  const hasEnd = columns.some((c) => pinSideOf(c.id, pinned) === 'right');
  const active = sized || hasStart || hasEnd;
  if (!active) {
    for (const c of columns) map.set(c.id, {});
    return { columns: map, lead: {}, trail: {} };
  }
  const widthOf = (c: DataTableColumn<T>) => columnWidthOf(c, widths);
  const fixed = (w: number): CSSProperties => ({ width: w, minWidth: w, maxWidth: w });

  let start = lead ? LEAD_WIDTH : 0;
  const startIds = columns.filter((c) => pinSideOf(c.id, pinned) === 'left');
  startIds.forEach((c, i) => {
    const w = widthOf(c);
    map.set(c.id, {
      pinned: 'left',
      style: { ...fixed(w), insetInlineStart: start },
      className: [STICKY, i === startIds.length - 1 && START_EDGE].filter(Boolean).join(' '),
    });
    start += w;
  });
  let end = trail ? TRAIL_WIDTH : 0;
  const endIds = columns.filter((c) => pinSideOf(c.id, pinned) === 'right');
  [...endIds].reverse().forEach((c, i) => {
    const w = widthOf(c);
    map.set(c.id, {
      pinned: 'right',
      style: { ...fixed(w), insetInlineEnd: end },
      className: [STICKY, i === endIds.length - 1 && END_EDGE].filter(Boolean).join(' '),
    });
    end += w;
  });
  for (const c of columns) if (!map.has(c.id)) map.set(c.id, { style: fixed(widthOf(c)) });

  const total = columns.reduce((sum, c) => sum + widthOf(c), 0) + (lead ? LEAD_WIDTH : 0) + (trail ? TRAIL_WIDTH : 0);
  return {
    columns: map,
    lead: hasStart ? { pinned: 'left', style: { insetInlineStart: 0 }, className: STICKY } : {},
    trail: hasEnd ? { pinned: 'right', style: { insetInlineEnd: 0 }, className: STICKY } : {},
    tableClassName: 'table-fixed',
    tableStyle: { width: total, minWidth: '100%' },
  };
}

/** Under-content tint for sticky cells of a hovered or selected row (and the header surface). */
export function stickyTint(layout: CellLayout | undefined, { selected = false, head = false } = {}): string | undefined {
  if (!layout?.pinned) return undefined;
  const base = 'before:pointer-events-none before:absolute before:inset-0 before:-z-10';
  if (head) return `${base} before:bg-secondary/30`;
  return `${base} ${selected ? 'before:bg-primary/8' : '[tr:hover>&]:before:bg-accent/30'}`;
}
