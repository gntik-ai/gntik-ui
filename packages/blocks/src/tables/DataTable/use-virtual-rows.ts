import { useEffect, useState, type RefObject } from 'react';

/** The items to render: `[start, end)` of the flattened body, each `rowHeight` px tall. */
export interface VirtualWindow {
  start: number;
  end: number;
  rowHeight: number;
}

export interface UseVirtualRowsOptions {
  enabled: boolean;
  count: number;
  rowHeight: number;
  /** The `<table>`; its parent is the scroll container. */
  tableRef: RefObject<HTMLTableElement | null>;
  /** Fallback viewport height before the container is measured (and in jsdom). */
  viewportHeight: number;
  /** Extra rows rendered above and below the viewport. */
  overscan?: number;
}

/** Computes a virtual window from the table container's scroll position. */
export function windowFor(count: number, scrollTop: number, viewport: number, rowHeight: number, overscan: number): VirtualWindow {
  const h = Math.max(1, rowHeight);
  const first = Math.floor(Math.max(0, scrollTop) / h);
  const visible = Math.ceil(viewport / h) + 1;
  const start = Math.max(0, Math.min(count, first - overscan));
  const end = Math.max(start, Math.min(count, first + visible + overscan));
  return { start, end, rowHeight: h };
}

/**
 * Row virtualization for the DataTable: listens to the scroll container of the table and returns
 * the window of items to render, or `undefined` when disabled.
 */
export function useVirtualRows({ enabled, count, rowHeight, tableRef, viewportHeight, overscan = 8 }: UseVirtualRowsOptions): VirtualWindow | undefined {
  const [scroll, setScroll] = useState({ top: 0, height: viewportHeight });

  useEffect(() => {
    const el = tableRef.current?.parentElement;
    if (!enabled || !el) return undefined;
    let frame = 0;
    const read = () => {
      frame = 0;
      setScroll((prev) => {
        const height = el.clientHeight || prev.height;
        return prev.top === el.scrollTop && prev.height === height ? prev : { top: el.scrollTop, height };
      });
    };
    const schedule = () => {
      if (frame) return;
      frame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(read) : (setTimeout(read, 0) as unknown as number);
    };
    el.addEventListener('scroll', schedule, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    ro?.observe(el);
    schedule();
    return () => {
      el.removeEventListener('scroll', schedule);
      ro?.disconnect();
      if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
    };
  }, [enabled, tableRef]);

  if (!enabled) return undefined;
  return windowFor(count, scroll.top, scroll.height, rowHeight, overscan);
}
