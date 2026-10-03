import { useMemo } from 'react';

/** Prefix offsets for `count` rows: `offsets[i]` is the top of row i, `offsets[count]` the total height. */
export function computeOffsets(count: number, sizeOf: (index: number) => number): number[] {
  const offsets = new Array<number>(count + 1);
  offsets[0] = 0;
  for (let i = 0; i < count; i++) offsets[i + 1] = (offsets[i] ?? 0) + sizeOf(i);
  return offsets;
}

/** Index of the row containing `y` (binary search over the offsets). */
export function rowAt(offsets: number[], y: number): number {
  let lo = 0;
  let hi = offsets.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((offsets[mid] ?? 0) <= y) lo = mid;
    else hi = mid - 1;
  }
  return Math.max(lo, 0);
}

export interface VirtualWindow {
  offsets: number[];
  start: number;
  end: number;
  total: number;
}

/** The rendered window [start, end] for a scroll position, viewport height and overscan. */
export function useVirtualWindow(count: number, sizeOf: (index: number) => number, scrollTop: number, viewportHeight: number, overscan: number): VirtualWindow {
  const offsets = useMemo(() => computeOffsets(count, sizeOf), [count, sizeOf]);
  if (count === 0) return { offsets, start: 0, end: -1, total: 0 };
  const first = rowAt(offsets, scrollTop);
  const last = rowAt(offsets, scrollTop + Math.max(viewportHeight, 1) - 1);
  return {
    offsets,
    start: Math.max(0, first - overscan),
    end: Math.min(count - 1, last + overscan),
    total: offsets[count] ?? 0,
  };
}
