import { useCallback, useMemo, useState } from 'react';
import { computeOffsets, useVirtualWindow } from '@gntik-ai/ui';
import type { LogLine } from './fixtures';

/** Measurements belong to line IDs, independent of the current filtered indices. */
export function useWrappedLogRows(
  enabled: boolean,
  lines: LogLine[],
  rowHeight: number,
  height: number,
  overscan: number,
  scrollTop: number,
  follow: boolean,
) {
  const [sizes, setSizes] = useState<ReadonlyMap<string, number>>(new Map());
  const count = enabled ? lines.length : 0;
  const sizeOf = useCallback(
    (index: number) => sizes.get(lines[index]?.id ?? '') ?? rowHeight,
    [lines, sizes, rowHeight],
  );
  const offsets = useMemo(() => computeOffsets(count, sizeOf), [count, sizeOf]);
  const total = offsets[count] ?? 0;
  const maxScroll = Math.max(0, total - height);
  const win = useVirtualWindow(count, sizeOf, follow ? maxScroll : Math.min(scrollTop, maxScroll), height, overscan);

  const measureRow = useCallback((node: HTMLDivElement | null, id: string) => {
    if (!node) return;
    const measure = () => {
      const measured = node.getBoundingClientRect().height;
      if (measured > 0)
        setSizes((previous) => (previous.get(id) === measured ? previous : new Map(previous).set(id, measured)));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    // React 19 ref cleanup disconnects on removal, ref replacement and unmount.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ...win, end: win.end + 1, measureRow };
}
