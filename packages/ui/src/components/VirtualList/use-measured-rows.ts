import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type UIEvent } from 'react';
import { useVirtualWindow } from './use-virtual-window';

export interface MeasuredRowOptions {
  /** Fixed row height in px; omit to measure mounted rows. */
  itemHeight?: number;
  /** Initial height for unmeasured rows. Default 32. */
  estimatedItemHeight?: number;
  /** Extra rows on either side of the viewport. Default 4. */
  overscan?: number;
}

/** Shared measurement, window and instant scrolling for option lists. */
export function useMeasuredRows(
  items: readonly unknown[],
  { itemHeight, estimatedItemHeight = 32, overscan = 4 }: MeasuredRowOptions,
  active = -1,
  initialHeight = 256,
) {
  const count = items.length;
  const viewport = useRef<HTMLElement | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const rowItems = useRef(new WeakMap<HTMLElement, unknown>());
  const scrollTarget = useRef<number | null>(null);
  const programmaticTop = useRef<number | null>(null);
  const [sizes, setSizes] = useState<ReadonlyMap<unknown, number>>(new Map());
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(initialHeight);
  const sizeOf = useCallback(
    (i: number) => itemHeight ?? sizes.get(items[i]) ?? estimatedItemHeight,
    [itemHeight, items, sizes, estimatedItemHeight],
  );
  const win = useVirtualWindow(count, sizeOf, scrollTop, height, overscan);

  const setViewport = useCallback((node: HTMLElement | null) => {
    viewport.current = node;
    if (!node) return;
    const update = () => {
      if (node.clientHeight) setHeight(node.clientHeight);
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const measureRow = useCallback(
    (node: HTMLElement | null, item: unknown) => {
      if (!node || itemHeight !== undefined) return;
      rowItems.current.set(node, item);
      const measure = (element: HTMLElement) => {
        const key = rowItems.current.get(element);
        const h = element.getBoundingClientRect().height;
        if (h > 0) setSizes((prev) => (prev.get(key) === h ? prev : new Map(prev).set(key, h)));
      };
      measure(node);
      if (typeof ResizeObserver === 'undefined') return;
      observer.current ??= new ResizeObserver((entries) => {
        entries.forEach((entry) => measure(entry.target as HTMLElement));
      });
      const ro = observer.current;
      ro.observe(node);
      return () => ro.unobserve(node);
    },
    [itemHeight],
  );
  useLayoutEffect(() => () => observer.current?.disconnect(), []);

  const scrollTo = useCallback(
    (index: number) => {
      scrollTarget.current = index;
      const node = viewport.current;
      if (!node) return;
      const top = win.offsets[index] ?? 0;
      const bottom = top + sizeOf(index);
      const h = node.clientHeight || height;
      const next =
        index < 0 ? 0 : top < node.scrollTop ? top : bottom > node.scrollTop + h ? bottom - h : node.scrollTop;
      node.scrollTop = Math.max(0, Math.min(next, Math.max(0, win.total - h)));
      programmaticTop.current = node.scrollTop;
      setScrollTop(node.scrollTop);
    },
    [win.offsets, win.total, sizeOf, height],
  );

  // Correct estimates as rows are measured, until the user scrolls independently.
  useLayoutEffect(() => {
    if (scrollTarget.current !== null) scrollTo(scrollTarget.current);
  }, [scrollTo]);

  const indices = Array.from({ length: Math.max(0, win.end - win.start + 1) }, (_, i) => win.start + i);
  if (active >= 0 && active < count && !indices.includes(active)) indices.push(active);
  indices.sort((a, b) => a - b);
  const rowProps = (i: number) => ({
    // Reused DOM nodes must be measured again when their item or index changes.
    ref: (node: HTMLElement | null) => measureRow(node, items[i]),
    'data-index': i,
    'aria-setsize': count,
    'aria-posinset': i + 1,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      transform: `translateY(${win.offsets[i] ?? 0}px)`,
      height: itemHeight,
    } satisfies CSSProperties,
  });
  return {
    indices,
    total: win.total,
    rowProps,
    setViewport,
    scrollTo,
    pageSize: Math.max(1, Math.floor(height / sizeOf(Math.max(0, active))) - 1),
    onScroll: (event: UIEvent<HTMLElement>) => {
      const top = event.currentTarget.scrollTop;
      if (top !== programmaticTop.current) scrollTarget.current = null;
      setScrollTop(top);
    },
  };
}
