import { useEffect, useEffectEvent, useRef, type RefObject } from 'react';

interface AutoPageSizeOptions {
  enabled: boolean;
  viewportRef: RefObject<HTMLDivElement | null>;
  tableRef: RefObject<HTMLTableElement | null>;
  rowHeight: number;
  pageSize: number;
  defaultPageSize: number;
  showCaption: boolean;
  onResize: (size: number) => void;
}

/** Observe available space, never tbody or the table's content-dependent height. */
export function useAutoPageSize({
  enabled,
  viewportRef,
  tableRef,
  rowHeight,
  pageSize,
  defaultPageSize,
  showCaption,
  onResize,
}: AutoPageSizeOptions) {
  const previous = useRef<number | undefined>(undefined);
  const warned = useRef(false);
  const resize = useEffectEvent((size: number) => {
    if (size !== pageSize) onResize(size);
  });
  useEffect(() => {
    const viewport = viewportRef.current;
    const table = tableRef.current;
    if (!enabled) {
      previous.current = undefined;
      return;
    }
    if (!viewport || !table) return;
    const read = () => {
      const height = viewport.clientHeight;
      if (height <= 0) {
        if (!warned.current && process.env.NODE_ENV !== 'production') {
          console.warn('DataTable autoPageSize needs a parent with a definite height; using defaultPageSize.');
          warned.current = true;
        }
        if (previous.current !== defaultPageSize) {
          previous.current = defaultPageSize;
          resize(defaultPageSize);
        }
        return;
      }
      const header = table.tHead?.getBoundingClientRect().height ?? 0;
      const caption = showCaption ? (table.caption?.getBoundingClientRect().height ?? 0) : 0;
      const next = Math.max(1, Math.floor((height - header - caption) / Math.max(1, rowHeight)));
      if (next === previous.current) return;
      previous.current = next;
      resize(next);
    };
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(read);
    observer?.observe(viewport);
    read();
    return () => observer?.disconnect();
  }, [enabled, viewportRef, tableRef, rowHeight, showCaption, defaultPageSize]);
}
