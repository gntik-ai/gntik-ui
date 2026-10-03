import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useI18n } from '../../i18n/I18nProvider';

/** A list of sortable items (a column, a lane, a single list). */
export interface SortableContainer {
  id: string;
  /** Item ids in order. */
  items: string[];
}

/** Where an item sits: container id and index (after removing the dragged item). */
export interface SortablePosition {
  containerId: string;
  index: number;
}

/** A completed move. `toIndex` is the index in the destination list once the item is removed from its origin. */
export interface SortableMove {
  itemId: string;
  fromContainerId: string;
  fromIndex: number;
  toContainerId: string;
  toIndex: number;
}

export type SortableMode = 'keyboard' | 'pointer';

export interface SortableDrag {
  itemId: string;
  mode: SortableMode;
  origin: SortablePosition;
  over: SortablePosition;
}

/** Lifecycle events, e.g. to announce them through a LiveAnnouncer. */
export interface SortableEvents {
  onDragStart?: (drag: SortableDrag) => void;
  onDragOver?: (drag: SortableDrag) => void;
  /** Fired on drop, whether or not the position changed (`onMove` only fires on a change). */
  onDragEnd?: (drag: SortableDrag) => void;
  onDragCancel?: (drag: SortableDrag) => void;
}

export interface UseSortableOptions extends SortableEvents {
  containers: SortableContainer[];
  /** Called once on drop when the item lands somewhere new. Apply it to your state (see `moveKanbanCard`). */
  onMove: (move: SortableMove) => void;
  disabled?: boolean;
  /** Pixels the pointer must travel before a drag starts (clicks below it stay clicks). Default 5. */
  activationDistance?: number;
  /** Touch press-and-hold delay in ms before a drag starts, so swipes still scroll. Default 250. */
  touchDelay?: number;
}

export interface SortableItemProps {
  ref: (el: HTMLElement | null) => () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  'aria-pressed': boolean;
  'data-sortable-item': string;
  'data-dragging'?: '';
}

export interface SortableContainerProps {
  ref: (el: HTMLElement | null) => () => void;
  'data-sortable-container': string;
  'data-over'?: '';
}

export interface UseSortableResult {
  /** The containers in preview order: render these (the dragged item already sits at its target). */
  containers: SortableContainer[];
  drag: SortableDrag | null;
  getItemProps: (itemId: string) => SortableItemProps;
  getContainerProps: (containerId: string) => SortableContainerProps;
  /** Cancels an in-progress drag (e.g. when the data changes underneath). */
  cancel: () => void;
}

function findPosition(containers: SortableContainer[], itemId: string): SortablePosition | null {
  for (const c of containers) {
    const index = c.items.indexOf(itemId);
    if (index >= 0) return { containerId: c.id, index };
  }
  return null;
}

/** Applies a drag to the containers: removes the item from its origin, inserts it at `over`. */
export function previewSortable(containers: SortableContainer[], drag: Pick<SortableDrag, 'itemId' | 'over'> | null): SortableContainer[] {
  if (!drag) return containers;
  const without = containers.map((c) => ({ id: c.id, items: c.items.filter((id) => id !== drag.itemId) }));
  return without.map((c) => {
    if (c.id !== drag.over.containerId) return c;
    const items = [...c.items];
    items.splice(Math.min(Math.max(drag.over.index, 0), items.length), 0, drag.itemId);
    return { id: c.id, items };
  });
}

const samePosition = (a: SortablePosition, b: SortablePosition) => a.containerId === b.containerId && a.index === b.index;

/**
 * Sortable lists with pointer and keyboard dragging, no dependencies. Space picks an item up,
 * arrows move it (↑↓ within a list, ←→ across lists, mirrored in RTL), Home/End jump to the
 * ends, Space or Enter drops, Escape (or Tab) cancels. Pointer drags start after a few pixels
 * (or a press-and-hold on touch). Controlled: the hook only previews; `onMove` commits.
 */
export function useSortable({
  containers,
  onMove,
  disabled = false,
  activationDistance = 5,
  touchDelay = 250,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
}: UseSortableOptions): UseSortableResult {
  const { dir } = useI18n();
  const [drag, setDrag] = useState<SortableDrag | null>(null);
  const itemEls = useRef(new Map<string, HTMLElement>());
  const containerEls = useRef(new Map<string, HTMLElement>());
  const preview = useMemo(() => previewSortable(containers, drag), [containers, drag]);

  // Latest values for window listeners and stable callbacks.
  const latest = useRef({ containers, preview, drag, onMove, onDragStart, onDragOver, onDragEnd, onDragCancel });
  useLayoutEffect(() => {
    latest.current = { containers, preview, drag, onMove, onDragStart, onDragOver, onDragEnd, onDragCancel };
  });

  const start = useCallback((itemId: string, mode: SortableMode) => {
    const origin = findPosition(latest.current.containers, itemId);
    if (!origin) return null;
    const next: SortableDrag = { itemId, mode, origin, over: origin };
    latest.current.drag = next;
    setDrag(next);
    latest.current.onDragStart?.(next);
    return next;
  }, []);

  const moveTo = useCallback((over: SortablePosition) => {
    const current = latest.current.drag;
    if (!current || samePosition(current.over, over)) return;
    const next = { ...current, over };
    latest.current.drag = next;
    setDrag(next);
    latest.current.onDragOver?.(next);
  }, []);

  const drop = useCallback(() => {
    const current = latest.current.drag;
    if (!current) return;
    latest.current.drag = null;
    setDrag(null);
    if (!samePosition(current.origin, current.over)) {
      latest.current.onMove({
        itemId: current.itemId,
        fromContainerId: current.origin.containerId,
        fromIndex: current.origin.index,
        toContainerId: current.over.containerId,
        toIndex: current.over.index,
      });
    }
    latest.current.onDragEnd?.(current);
  }, []);

  const cancel = useCallback(() => {
    const current = latest.current.drag;
    if (!current) return;
    latest.current.drag = null;
    setDrag(null);
    latest.current.onDragCancel?.(current);
  }, []);

  // Keep keyboard focus on the dragged item when it re-mounts in another list, and after a drop.
  const focusTarget = drag?.mode === 'keyboard' ? drag.itemId : null;
  const lastKeyboardItem = useRef<string | null>(null);
  useLayoutEffect(() => {
    const id = focusTarget ?? lastKeyboardItem.current;
    lastKeyboardItem.current = focusTarget;
    if (!id) return;
    const el = itemEls.current.get(id);
    if (el && document.activeElement !== el && (focusTarget || !el.contains(document.activeElement))) el.focus({ preventScroll: false });
  });

  /** Position under the pointer: container by x (nearest if outside all), index by item midpoints. */
  const hitTest = useCallback((x: number, y: number, itemId: string): SortablePosition | null => {
    let best: { id: string; dist: number } | null = null;
    for (const [id, el] of containerEls.current) {
      const r = el.getBoundingClientRect();
      const dist = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
      if (!best || dist < best.dist) best = { id, dist };
    }
    if (!best) return null;
    const list = latest.current.preview.find((c) => c.id === best.id);
    if (!list) return null;
    let index = 0;
    for (const id of list.items) {
      if (id === itemId) continue;
      const el = itemEls.current.get(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top + r.height / 2 < y) index++;
    }
    return { containerId: best.id, index };
  }, []);

  const pointerCleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => pointerCleanup.current?.(), []);

  const onPointerDown = useCallback(
    (itemId: string, event: ReactPointerEvent<HTMLElement>) => {
      if (disabled || event.button !== 0 || !event.isPrimary || latest.current.drag) return;
      const target = event.target as HTMLElement;
      if (target !== event.currentTarget && target.closest('a, button, input, select, textarea, [contenteditable="true"]')) return;
      pointerCleanup.current?.();
      const startX = event.clientX;
      const startY = event.clientY;
      const pointerId = event.pointerId;
      const touch = event.pointerType === 'touch';
      let active = false;
      let timer = 0;
      const begin = () => {
        if (active) return;
        active = !!start(itemId, 'pointer');
      };
      if (touch) timer = window.setTimeout(begin, touchDelay);
      const move = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        if (!active) {
          const far = Math.hypot(e.clientX - startX, e.clientY - startY) >= activationDistance;
          if (touch) {
            if (far) cleanup();
            return;
          }
          if (!far) return;
          begin();
        }
        const over = hitTest(e.clientX, e.clientY, itemId);
        if (over) moveTo(over);
      };
      const up = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        if (active) {
          // Swallow the click that follows a drag.
          const swallow = (c: MouseEvent) => {
            c.stopPropagation();
            c.preventDefault();
          };
          window.addEventListener('click', swallow, { capture: true, once: true });
          window.setTimeout(() => window.removeEventListener('click', swallow, true), 0);
          drop();
        }
        cleanup();
      };
      const cancelPointer = () => {
        if (active) cancel();
        cleanup();
      };
      const key = (e: globalThis.KeyboardEvent) => {
        if (e.key === 'Escape' && active) {
          e.preventDefault();
          cancelPointer();
        }
      };
      const touchMove = (e: TouchEvent) => {
        if (active) e.preventDefault();
      };
      function cleanup() {
        window.clearTimeout(timer);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancelPointer);
        window.removeEventListener('keydown', key, true);
        window.removeEventListener('touchmove', touchMove);
        pointerCleanup.current = null;
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', cancelPointer);
      window.addEventListener('keydown', key, true);
      window.addEventListener('touchmove', touchMove, { passive: false });
      pointerCleanup.current = cleanup;
    },
    [disabled, start, hitTest, moveTo, drop, cancel, activationDistance, touchDelay],
  );

  const onKeyDown = useCallback(
    (itemId: string, event: KeyboardEvent<HTMLElement>) => {
      if (disabled || event.target !== event.currentTarget) return;
      const current = latest.current.drag;
      if (!current) {
        if (event.key === ' ') {
          event.preventDefault();
          start(itemId, 'keyboard');
        }
        return;
      }
      if (current.itemId !== itemId || current.mode !== 'keyboard') return;
      const lists = latest.current.preview;
      const ci = lists.findIndex((c) => c.id === current.over.containerId);
      const lengthOf = (i: number) => (lists[i]?.items.filter((id) => id !== itemId).length ?? 0);
      const across = (step: number) => {
        const ni = Math.min(Math.max(ci + step, 0), lists.length - 1);
        const next = lists[ni];
        if (next) moveTo({ containerId: next.id, index: Math.min(current.over.index, lengthOf(ni)) });
      };
      const rtl = dir === 'rtl';
      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          drop();
          return;
        case 'Escape':
          event.preventDefault();
          cancel();
          return;
        case 'Tab':
          cancel();
          return;
        case 'ArrowUp':
          event.preventDefault();
          moveTo({ ...current.over, index: Math.max(current.over.index - 1, 0) });
          return;
        case 'ArrowDown':
          event.preventDefault();
          moveTo({ ...current.over, index: Math.min(current.over.index + 1, lengthOf(ci)) });
          return;
        case 'ArrowLeft':
          event.preventDefault();
          across(rtl ? 1 : -1);
          return;
        case 'ArrowRight':
          event.preventDefault();
          across(rtl ? -1 : 1);
          return;
        case 'Home':
          event.preventDefault();
          moveTo({ ...current.over, index: 0 });
          return;
        case 'End':
          event.preventDefault();
          moveTo({ ...current.over, index: lengthOf(ci) });
          return;
        default:
      }
    },
    [disabled, dir, start, moveTo, drop, cancel],
  );

  const getItemProps = useCallback(
    (itemId: string): SortableItemProps => ({
      ref: (el) => {
        if (el) itemEls.current.set(itemId, el);
        return () => {
          if (el && itemEls.current.get(itemId) === el) itemEls.current.delete(itemId);
        };
      },
      onKeyDown: (e) => onKeyDown(itemId, e),
      onPointerDown: (e) => onPointerDown(itemId, e),
      'aria-pressed': drag?.itemId === itemId,
      'data-sortable-item': itemId,
      'data-dragging': drag?.itemId === itemId ? '' : undefined,
    }),
    [drag, onKeyDown, onPointerDown],
  );

  const getContainerProps = useCallback(
    (containerId: string): SortableContainerProps => ({
      ref: (el) => {
        if (el) containerEls.current.set(containerId, el);
        return () => {
          if (el && containerEls.current.get(containerId) === el) containerEls.current.delete(containerId);
        };
      },
      'data-sortable-container': containerId,
      'data-over': drag && drag.over.containerId === containerId ? '' : undefined,
    }),
    [drag],
  );

  return { containers: preview, drag, getItemProps, getContainerProps, cancel };
}
