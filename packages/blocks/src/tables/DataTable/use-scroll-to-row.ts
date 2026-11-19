import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref, type RefObject } from 'react';
import type { DataTableBodyItem } from './data-table-body';
import type { VirtualWindow } from './use-virtual-rows';
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
  virtual?: VirtualWindow;
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

/** Notify the virtual window after an imperative DOM scroll, including in non-layout environments. */
function scrollContainer(container: HTMLElement, top: number) {
  container.scrollTop = top;
  container.dispatchEvent(new Event('scroll'));
}

/** Wait for controlled page/group updates before using the revealed row's DOM. */
export function useScrollToRow<T>({
  ref,
  tableRef,
  rows,
  items,
  virtual,
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
  const completed = useRef<typeof pending>(null);
  useImperativeHandle(ref, () => ({
    scrollToRow(id, scrollOptions = {}) {
      const index = rows.findIndex((row) => getRowId(row) === id);
      const row = rows[index];
      if (index < 0 || row === undefined) return false;
      setPending({ id, options: scrollOptions });
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
    if (!pending || completed.current === pending) return;
    const table = tableRef.current;
    const container = table?.parentElement;
    const index = items.findIndex((item) => item.kind === 'row' && getRowId(item.row) === pending.id);
    if (index < 0) return;
    if (virtual && container) {
      const height = virtual.rowHeight;
      const viewport = container.clientHeight || 512;
      const top = index * height;
      const current = container.scrollTop;
      const align = pending.options.align ?? 'auto';
      const offset =
        align === 'center'
          ? top - (viewport - height) / 2
          : align === 'start'
            ? top
            : align === 'end'
              ? top + height - viewport
              : top < current
                ? top
                : top + height > current + viewport
                  ? top + height - viewport
                  : current;
      const next = Math.max(0, Math.min(offset, items.length * height - viewport));
      if (current !== next) scrollContainer(container, next);
    }
    const row =
      table &&
      [...table.querySelectorAll<HTMLTableRowElement>('[data-row-id]')].find((el) => el.dataset.rowId === pending.id);
    if (!row) return;
    if (!virtual)
      row.scrollIntoView?.({
        block: pending.options.align === 'auto' ? 'nearest' : (pending.options.align ?? 'nearest'),
        behavior: 'instant',
      });
    if (pending.options.focus) row.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    completed.current = pending;
  }, [pending, tableRef, items, virtual, getRowId]);
}
