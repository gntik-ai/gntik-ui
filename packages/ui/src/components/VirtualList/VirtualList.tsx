import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type Key,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../../utils/cn';
import { useVirtualWindow } from './use-virtual-window';
import { virtualListVariants, type VirtualListVariantProps } from './virtual-list.variants';

export type VirtualListAlign = 'auto' | 'start' | 'center' | 'end';

export interface VirtualListHandle {
  /** Scrolls a row into view; with `focus` it also becomes the active (tabbable) row and takes focus. */
  scrollToIndex: (index: number, options?: { align?: VirtualListAlign; focus?: boolean }) => void;
}

export interface VirtualListItemState {
  /** The row holds the roving tab stop. */
  active: boolean;
  /** Listbox only: the row is the selected option. */
  selected: boolean;
}

export interface VirtualListProps<T> extends VirtualListVariantProps {
  items: readonly T[];
  renderItem: (item: T, index: number, state: VirtualListItemState) => ReactNode;
  /** Stable key per item (also the selection key in listbox mode). Defaults to the index. */
  getKey?: (item: T, index: number) => Key;
  /** Fixed row height in px. Omit it to measure rows, starting from `estimatedItemHeight`. */
  itemHeight?: number;
  estimatedItemHeight?: number;
  /** Viewport height (px or any CSS length). */
  height?: number | string;
  /** Rows rendered above and below the visible window. */
  overscan?: number;
  /** `list` for read-only rows, `listbox` for a single-select option list. */
  role?: 'list' | 'listbox';
  selectedKey?: Key | null;
  defaultSelectedKey?: Key | null;
  onSelectedKeyChange?: (key: Key, item: T, index: number) => void;
  /** Enter on a row (list mode), or after selecting (listbox mode). */
  onActivate?: (item: T, index: number) => void;
  /** Shown when there are no items. */
  emptyText?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  rowClassName?: string;
  ref?: Ref<VirtualListHandle>;
}

/**
 * Windowed list: renders only the rows in view (plus `overscan`), with fixed or measured row
 * heights. Rows use a roving tabindex (one tab stop, arrows/Page/Home/End move it, the
 * active row is kept mounted when scrolled away) and carry aria-setsize / aria-posinset.
 */
export function VirtualList<T>({
  items,
  renderItem,
  getKey = (_item, index) => index,
  itemHeight,
  estimatedItemHeight = 36,
  height = 320,
  overscan = 4,
  role = 'list',
  selectedKey,
  defaultSelectedKey = null,
  onSelectedKeyChange,
  onActivate,
  emptyText = 'No items.',
  divided,
  className,
  rowClassName,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: VirtualListProps<T>) {
  const count = items.length;
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(typeof height === 'number' ? height : 320);
  const [sizes, setSizes] = useState<Record<number, number>>({});
  const [activeState, setActive] = useState(0);
  const [innerSelected, setInnerSelected] = useState<Key | null>(defaultSelectedKey);
  const selected = selectedKey !== undefined ? selectedKey : innerSelected;
  const active = Math.min(activeState, Math.max(count - 1, 0));
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rowObserver = useRef<ResizeObserver | null>(null);
  const pendingFocus = useRef(false);
  const s = virtualListVariants({ divided });
  const isListbox = role === 'listbox';

  const sizeOf = useCallback((i: number) => itemHeight ?? sizes[i] ?? estimatedItemHeight, [itemHeight, sizes, estimatedItemHeight]);
  const win = useVirtualWindow(count, sizeOf, scrollTop, viewportHeight, overscan);

  const scrollToIndex = (index: number, align: VirtualListAlign = 'auto') => {
    const vp = viewportRef.current;
    if (!vp || count === 0) return;
    const i = Math.min(Math.max(index, 0), count - 1);
    const top = win.offsets[i] ?? 0;
    const bottom = top + sizeOf(i);
    const h = vp.clientHeight || viewportHeight;
    let next = vp.scrollTop;
    if (align === 'start') next = top;
    else if (align === 'end') next = bottom - h;
    else if (align === 'center') next = top - (h - (bottom - top)) / 2;
    else if (top < vp.scrollTop) next = top;
    else if (bottom > vp.scrollTop + h) next = bottom - h;
    next = Math.max(0, Math.min(next, win.total - h));
    vp.scrollTop = next;
    setScrollTop(next);
  };

  const moveTo = (index: number, align: VirtualListAlign = 'auto') => {
    if (count === 0) return;
    const i = Math.min(Math.max(index, 0), count - 1);
    pendingFocus.current = true;
    setActive(i);
    scrollToIndex(i, align);
  };

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index, options) => (options?.focus ? moveTo(index, options.align) : scrollToIndex(index, options?.align)),
  }));

  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    viewportRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.focus({ preventScroll: true });
  });

  const select = (index: number) => {
    const item = items[index];
    if (item === undefined) return;
    const key = getKey(item, index);
    setInnerSelected(key);
    onSelectedKeyChange?.(key, item, index);
    onActivate?.(item, index);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const row = e.target as HTMLElement;
    if (row.dataset.index === undefined || row.parentElement?.parentElement !== e.currentTarget) return;
    const from = Number(row.dataset.index);
    const page = Math.max(1, Math.floor((e.currentTarget.clientHeight || viewportHeight) / (itemHeight ?? estimatedItemHeight)) - 1);
    const keys: Record<string, () => void> = {
      ArrowDown: () => moveTo(from + 1),
      ArrowUp: () => moveTo(from - 1),
      PageDown: () => moveTo(from + page, 'start'),
      PageUp: () => moveTo(from - page, 'end'),
      Home: () => moveTo(0),
      End: () => moveTo(count - 1),
    };
    if ((e.key === 'Enter' || (isListbox && e.key === ' '))) {
      e.preventDefault();
      if (isListbox) select(from);
      else if (items[from] !== undefined) onActivate?.(items[from] as T, from);
      return;
    }
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const setViewport = (node: HTMLDivElement | null) => {
    viewportRef.current = node;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) setViewportHeight(h);
    });
    ro.observe(node);
    return () => ro.disconnect();
  };

  const measureRow = (node: HTMLElement | null) => {
    if (!node || itemHeight != null || typeof ResizeObserver === 'undefined') return;
    rowObserver.current ??= new ResizeObserver((entries) => {
      setSizes((prev) => {
        let next = prev;
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.index);
          const h = Math.round((entry.target as HTMLElement).getBoundingClientRect().height);
          if (h > 0 && prev[i] !== h) next = { ...next, [i]: h };
        }
        return next;
      });
    });
    const ro = rowObserver.current;
    ro.observe(node);
    return () => ro.unobserve(node);
  };

  const indices: number[] = [];
  for (let i = win.start; i <= win.end; i++) indices.push(i);
  if (count > 0 && (active < win.start || active > win.end)) indices.push(active);

  return (
    <div
      ref={setViewport}
      className={cn(s.viewport(), className)}
      style={{ height }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      onKeyDown={onKeyDown}
    >
      {count === 0 ? (
        <div className={s.empty()} role="status">
          {emptyText}
        </div>
      ) : (
        <div role={role} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className={s.spacer()} style={{ height: win.total }}>
          {indices.map((i) => {
            const item = items[i] as T;
            const key = getKey(item, i);
            const isActive = i === active;
            const isSelected = isListbox && selected === key;
            const style: CSSProperties = { transform: `translateY(${win.offsets[i] ?? 0}px)`, height: itemHeight };
            return (
              <div
                key={key}
                ref={measureRow}
                role={isListbox ? 'option' : 'listitem'}
                data-index={i}
                data-active={isActive || undefined}
                tabIndex={isActive ? 0 : -1}
                aria-setsize={count}
                aria-posinset={i + 1}
                aria-selected={isListbox ? isSelected : undefined}
                className={cn(s.row(), isListbox && s.option(), rowClassName)}
                style={style}
                onFocus={() => setActive(i)}
                onClick={isListbox ? () => select(i) : undefined}
              >
                {renderItem(item, i, { active: isActive, selected: isSelected })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
