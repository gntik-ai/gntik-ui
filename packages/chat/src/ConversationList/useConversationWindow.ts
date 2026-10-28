import { useVirtualWindow } from '@gntik-ai/ui';
import { useCallback, useRef, useState } from 'react';
import type { ConversationEntry } from './ConversationGroup';

/** The virtual-window primitive does no measuring: retain sizes by stable row/group key here. */
export function useConversationWindow(entries: ConversationEntry[], tabKey: string | undefined, virtual: boolean) {
  const viewport = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState(600);
  const [scrollTop, setScrollTop] = useState(0);
  const [sizes, setSizes] = useState<ReadonlyMap<string, number>>(() => new Map());
  const sizeOf = useCallback(
    (index: number) => {
      const entry = entries[index];
      return entry ? (sizes.get(entry.key) ?? (entry.kind === 'group' ? 32 : entry.item.preview ? 64 : 44)) : 44;
    },
    [entries, sizes],
  );
  const win = useVirtualWindow(entries.length, sizeOf, scrollTop, height, 4);
  const setViewport = useCallback((node: HTMLElement | null) => {
    viewport.current = node;
    if (!node) return;
    if (node.clientHeight > 0) setHeight(node.clientHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (node.clientHeight > 0) setHeight(node.clientHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const measure = useCallback((key: string, node: HTMLElement | null) => {
    if (!node) return;
    const update = () => {
      const nextHeight = Math.ceil(node.getBoundingClientRect().height);
      if (nextHeight > 0)
        setSizes((previous) => {
          if (previous.get(key) === nextHeight) return previous;
          const next = new Map(previous);
          next.set(key, nextHeight);
          return next;
        });
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const indices = virtual
    ? Array.from({ length: Math.max(0, win.end - win.start + 1) }, (_, i) => win.start + i)
    : entries.map((_, i) => i);
  const pinnedIndex = entries.findIndex((entry) => entry.key === tabKey);
  if (virtual && pinnedIndex >= 0 && !indices.includes(pinnedIndex)) indices.push(pinnedIndex);
  indices.sort((a, b) => a - b);
  const reveal = (key: string) => {
    if (!virtual || !viewport.current) return;
    const index = entries.findIndex((entry) => entry.key === key);
    if (index < 0) return;
    const top = win.offsets[index] ?? 0;
    const bottom = win.offsets[index + 1] ?? top;
    const currentTop = viewport.current.scrollTop;
    const next = top < currentTop ? top : bottom > currentTop + height ? bottom - height : currentTop;
    viewport.current.scrollTop = next;
    setScrollTop(next);
  };
  return { indices, win, setViewport, setScrollTop, measure, reveal };
}
