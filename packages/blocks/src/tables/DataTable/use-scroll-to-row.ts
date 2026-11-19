import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref, type RefObject } from 'react';
import type { DataTableBodyItem } from './data-table-body';
import { setScrollTop, type VirtualRows } from './use-virtual-rows';
import { groupKeyOf, type DataTableGroupBy } from './data-table-utils';

export interface ScrollToRowOptions {
  align?: 'auto' | 'start' | 'center' | 'end';
  focus?: boolean;
}

export interface DataTableHandle {
  /** Reveal a listed row, requesting its client page and expanding its group. Never fetches server pages. */
  scrollToRow: (id: string, options?: ScrollToRowOptions) => boolean;
}

interface Options<T> {
  ref?: Ref<DataTableHandle>;
  tableRef: RefObject<HTMLTableElement | null>;
  rows: readonly T[];
  items: readonly DataTableBodyItem<T>[];
  virtual?: VirtualRows;
  viewportHeight: number;
  stickyHeader: boolean;
  getRowId: (row: T) => string;
  page: number;
  pageSize: number;
  paginated: boolean;
  serverMode: boolean;
  changePage: (page: number) => void;
  groupBy?: DataTableGroupBy<T>;
  collapsed: ReadonlySet<string>;
  toggleGroup: (key: string) => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]):not([data-disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])';

/** Positions a row within the viewport left below the sticky header. */
function alignedOffset(
  top: number,
  height: number,
  viewport: number,
  header: number,
  current: number,
  align: ScrollToRowOptions['align'],
) {
  if (align === 'center') return top - header - (Math.max(0, viewport - header) - height) / 2;
  if (align === 'start') return top - header;
  if (align === 'end') return top + height - viewport;
  if (top < current + header) return top - header;
  if (top + height > current + viewport) return top + height - viewport;
  return current;
}

/** Wait for controlled page/group updates before using the revealed row's DOM. */
export function useScrollToRow<T>({
  ref,
  tableRef,
  rows,
  items,
  virtual,
  viewportHeight,
  stickyHeader,
  getRowId,
  page: currentPage,
  pageSize,
  paginated,
  serverMode,
  changePage,
  groupBy,
  collapsed,
  toggleGroup,
}: Options<T>) {
  const [pending, setPending] = useState<{ id: string; options: ScrollToRowOptions } | null>(null);
  const active = useRef<typeof pending>(null);
  useImperativeHandle(ref, () => ({
    scrollToRow(id, scrollOptions = {}) {
      active.current = null;
      const index = rows.findIndex((row) => getRowId(row) === id);
      const row = rows[index];
      if (index < 0 || row === undefined) return false;
      active.current = { id, options: scrollOptions };
      setPending(active.current);
      const page = Math.floor(index / Math.max(1, pageSize)) + 1;
      if (!serverMode && paginated && page !== currentPage) changePage(page);
      if (groupBy) {
        const group = groupKeyOf(row, groupBy);
        if (collapsed.has(group)) toggleGroup(group);
      }
      return true;
    },
  }));

  useLayoutEffect(() => {
    if (!pending) return;
    const document = tableRef.current?.ownerDocument;
    if (!document) return;
    // A delayed controlled response must not steal focus after the user moves on.
    const cancel = () => {
      active.current = null;
    };
    document.addEventListener('pointerdown', cancel, true);
    document.addEventListener('keydown', cancel, true);
    document.addEventListener('click', cancel, true);
    return () => {
      document.removeEventListener('pointerdown', cancel, true);
      document.removeEventListener('keydown', cancel, true);
      document.removeEventListener('click', cancel, true);
    };
  }, [pending, tableRef]);

  useLayoutEffect(() => {
    if (!pending || active.current !== pending) return;
    const table = tableRef.current;
    const container = table?.parentElement;
    const index = items.findIndex((item) => item.kind === 'row' && getRowId(item.row) === pending.id);
    if (index < 0) return;
    if (virtual && container && table) {
      const height = virtual.rowHeight;
      const viewport = container.clientHeight || viewportHeight;
      // tbody's normal-flow origin includes the header and any top caption.
      // Rects share viewport coordinates, unlike offsetTop across offset parents.
      const body = table.tBodies[0];
      const origin = body
        ? body.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop -
          container.clientTop
        : 0;
      const header = stickyHeader ? (table.tHead?.offsetHeight ?? 0) : 0;
      const top = origin + index * height;
      const current = container.scrollTop;
      const offset = alignedOffset(top, height, viewport, header, current, pending.options.align);
      const next = Math.max(0, Math.min(offset, origin + items.length * height - viewport));
      if (current !== next) virtual.scrollTo(next);
    }
    const row =
      table &&
      [...table.querySelectorAll<HTMLTableRowElement>('[data-row-id]')].find((el) => el.dataset.rowId === pending.id);
    if (!row) return;
    if (!virtual) {
      row.scrollIntoView?.({
        block: pending.options.align === 'auto' ? 'nearest' : (pending.options.align ?? 'nearest'),
        behavior: 'instant',
      });
      // Native scrollIntoView does not account for the cells sticking over the row.
      if (stickyHeader && container && table) {
        const rect = row.getBoundingClientRect();
        const top = rect.top - container.getBoundingClientRect().top + container.scrollTop - container.clientTop;
        setScrollTop(
          container,
          Math.max(
            0,
            alignedOffset(
              top,
              rect.height,
              container.clientHeight || viewportHeight,
              table.tHead?.offsetHeight ?? 0,
              container.scrollTop,
              pending.options.align,
            ),
          ),
        );
      }
    }
    if (pending.options.focus) row.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    active.current = null;
  }, [pending, tableRef, items, virtual, viewportHeight, stickyHeader, getRowId]);
}
