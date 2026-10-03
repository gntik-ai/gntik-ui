import { GripHorizontal, GripVertical } from 'lucide-react';
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { cn } from '../../utils/cn';
import {
  defaultSizes,
  isCollapsed,
  loadSizes,
  movePair,
  saveSizes,
  setPair,
  clamp,
  type PanelConstraints,
} from './resizable-layout';
import { resizableVariants } from './resizable.variants';

type Direction = 'horizontal' | 'vertical';

interface GroupContextValue {
  direction: Direction;
  panels: PanelConstraints[];
  sizes: number[];
  restore: Record<string, number>;
  /** Applies new sizes; `persist` also writes them to localStorage (autoSaveId). */
  update: (sizes: number[], options?: { persist?: boolean; restore?: Record<string, number> }) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);
/** Index of the panel (for a panel) or of the panel before it (for a handle). */
const SlotContext = createContext<number>(-1);

function useGroup(part: string) {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error(`${part} must be a direct child of <ResizablePanelGroup>.`);
  return ctx;
}

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> & { className?: string; ref?: Ref<HTMLDivElement> };

export interface ResizablePanelGroupProps extends DivProps {
  /** `horizontal` lays panels out side by side (vertical handles); `vertical` stacks them. */
  direction?: Direction;
  /** Remembers the layout in localStorage under this key (ignored when storage is unavailable). */
  autoSaveId?: string;
  /** Called with the new sizes (%) after every resize, collapse or restore. */
  onLayout?: (sizes: number[]) => void;
}

interface GroupState {
  signature: string;
  sizes: number[];
  restore: Record<string, number>;
}

/**
 * Container of resizable panels. Children must be ResizablePanel and ResizeHandle elements
 * (direct children, alternating). Sizes are percentages of the group.
 */
export function ResizablePanelGroup({
  direction = 'horizontal',
  autoSaveId,
  onLayout,
  className,
  children,
  ...props
}: ResizablePanelGroupProps) {
  const baseId = useId();
  const items = Children.toArray(children);
  const panels: PanelConstraints[] = [];
  const slots: number[] = [];
  for (const child of items) {
    if (isValidElement(child) && child.type === ResizablePanel) {
      const p = (child as ReactElement<ResizablePanelProps>).props;
      const minSize = p.minSize ?? 0;
      panels.push({
        id: p.id ?? `${baseId}-panel-${panels.length}`,
        defaultSize: p.defaultSize,
        minSize,
        maxSize: p.maxSize ?? 100,
        collapsible: p.collapsible ?? false,
        collapsedSize: Math.min(p.collapsedSize ?? 0, minSize),
      });
    }
    slots.push(panels.length - 1);
  }
  const signature = panels.map((p) => `${p.id}:${p.minSize}:${p.maxSize}`).join('|');
  const initial = (): GroupState => ({
    signature,
    sizes: loadSizes(autoSaveId, panels.length) ?? defaultSizes(panels),
    restore: {},
  });
  const [state, setState] = useState<GroupState>(initial);
  // Panels added / removed / re-constrained: fall back to the (persisted or) default layout.
  const current = state.signature === signature ? state : initial();

  const update: GroupContextValue['update'] = (sizes, options) => {
    setState({ signature, sizes, restore: options?.restore ?? current.restore });
    onLayout?.(sizes);
    if (options?.persist) saveSizes(autoSaveId, sizes);
  };

  const ctx: GroupContextValue = { direction, panels, sizes: current.sizes, restore: current.restore, update };
  const s = resizableVariants({ direction });
  return (
    <GroupContext.Provider value={ctx}>
      <div data-resizable-group="" data-direction={direction} className={cn(s.group(), className)} {...props}>
        {items.map((child, i) => {
          const key = isValidElement(child) && child.key != null ? child.key : i;
          return (
            <SlotContext.Provider key={key} value={slots[i] ?? -1}>
              {child}
            </SlotContext.Provider>
          );
        })}
      </div>
    </GroupContext.Provider>
  );
}

export interface ResizablePanelProps extends DivProps {
  /** Stable id (also referenced by the handle's aria-controls). */
  id?: string;
  /** Initial size in % (panels without one share the remainder). */
  defaultSize?: number;
  /** Minimum size in %. */
  minSize?: number;
  /** Maximum size in %. */
  maxSize?: number;
  /** Can shrink to `collapsedSize` (drag past half its minimum, or Enter on the handle). */
  collapsible?: boolean;
  /** Size in % when collapsed. Default 0 (the content becomes inert). */
  collapsedSize?: number;
}

const PANEL_CONFIG_KEYS = ['id', 'defaultSize', 'minSize', 'maxSize', 'collapsible', 'collapsedSize'] as const;

/** Strips the layout config (read by the group) from the props spread onto the panel element. */
function domProps(props: Omit<ResizablePanelProps, 'className' | 'style'>): DivProps {
  const out: Partial<ResizablePanelProps> = { ...props };
  for (const key of PANEL_CONFIG_KEYS) delete out[key];
  return out;
}

/** One pane of a ResizablePanelGroup. */
export function ResizablePanel({ className, style, ...config }: ResizablePanelProps) {
  const props = domProps(config);
  const ctx = useGroup('ResizablePanel');
  const index = useContext(SlotContext);
  const panel = ctx.panels[index];
  const size = ctx.sizes[index] ?? 0;
  const collapsed = panel ? isCollapsed(size, panel) : false;
  return (
    <div
      id={panel?.id}
      data-resizable-panel=""
      data-collapsed={collapsed ? '' : undefined}
      data-size={Math.round(size)}
      inert={collapsed && size <= 0.01 ? true : undefined}
      className={cn(resizableVariants().panel(), className)}
      style={{ flexGrow: size, flexShrink: 1, flexBasis: 0, overflow: 'hidden', ...style }}
      {...props}
    />
  );
}

export interface ResizeHandleProps extends DivProps {
  /** Shows a small grip on the line. */
  withHandle?: boolean;
  /** Arrow-key step in %. Default 5. */
  step?: number;
  /** Not draggable nor focusable. */
  disabled?: boolean;
}

interface DragState {
  start: number;
  px: number;
  sizes: number[];
  last: number[];
}

/**
 * The draggable divider between two panels: role="separator" with aria-valuenow (size of the panel
 * before it). Pointer drag; arrows resize by `step`; Home / End jump to min / max; Enter collapses
 * or restores the adjacent collapsible panel.
 */
export function ResizeHandle({
  withHandle,
  step = 5,
  disabled,
  className,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  'aria-label': ariaLabel = 'Resize',
  ...props
}: ResizeHandleProps) {
  const ctx = useGroup('ResizeHandle');
  const i = useContext(SlotContext);
  const dragRef = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);
  const { direction, panels, sizes, restore, update } = ctx;
  const a = panels[i];
  const b = panels[i + 1];
  const sizeA = sizes[i] ?? 0;
  const horizontal = direction === 'horizontal';
  const s = resizableVariants({ direction });

  function toggleCollapse() {
    if (!a || !b) return;
    const sizeB = sizes[i + 1] ?? 0;
    const total = sizeA + sizeB;
    const target = a.collapsible ? a : b.collapsible ? b : null;
    if (!target) return;
    const current = target === a ? sizeA : sizeB;
    let nextTarget: number;
    let nextRestore = restore;
    if (isCollapsed(current, target)) {
      const remembered = restore[target.id] ?? target.defaultSize ?? target.minSize;
      const other = target === a ? b : a;
      nextTarget = clamp(remembered, target.minSize, Math.min(target.maxSize, total - other.minSize));
    } else {
      nextTarget = target.collapsedSize;
      nextRestore = { ...restore, [target.id]: current };
    }
    const nextA = target === a ? nextTarget : total - nextTarget;
    update(setPair(sizes, i, nextA), { persist: true, restore: nextRestore });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || !a || !b) return;
    const dec = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const inc = horizontal ? 'ArrowRight' : 'ArrowDown';
    let next: number[] | null = null;
    if (event.key === dec) next = movePair(sizes, panels, i, sizeA - step);
    else if (event.key === inc) next = movePair(sizes, panels, i, sizeA + step);
    else if (event.key === 'Home') next = movePair(sizes, panels, i, a.minSize);
    else if (event.key === 'End') next = movePair(sizes, panels, i, a.maxSize);
    else if (event.key === 'Enter') {
      event.preventDefault();
      toggleCollapse();
      return;
    }
    if (!next) return;
    event.preventDefault();
    update(next, { persist: true });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || disabled || event.button !== 0) return;
    const handle = event.currentTarget;
    const group = handle.parentElement;
    if (!group) return;
    event.preventDefault();
    handle.focus();
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {}
    let px = 0;
    group.querySelectorAll<HTMLElement>(':scope > [data-resizable-panel]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      px += horizontal ? rect.width : rect.height;
    });
    dragRef.current = { start: horizontal ? event.clientX : event.clientY, px, sizes, last: sizes };
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    const drag = dragRef.current;
    if (!drag || drag.px <= 0) return;
    const delta = (((horizontal ? event.clientX : event.clientY) - drag.start) / drag.px) * 100;
    const next = movePair(drag.sizes, panels, i, (drag.sizes[i] ?? 0) + delta);
    drag.last = next;
    update(next);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
    if (drag.last !== drag.sizes) update(drag.last, { persist: true });
  }

  const min = a ? (a.collapsible ? a.collapsedSize : a.minSize) : 0;
  const max = a && b ? Math.min(a.maxSize, sizeA + (sizes[i + 1] ?? 0) - (b.collapsible ? b.collapsedSize : b.minSize)) : 100;
  const Grip = horizontal ? GripVertical : GripHorizontal;
  return (
    <div
      role="separator"
      tabIndex={disabled ? undefined : 0}
      aria-label={ariaLabel}
      aria-orientation={horizontal ? 'vertical' : 'horizontal'}
      aria-controls={a?.id}
      aria-valuenow={Math.round(sizeA)}
      aria-valuemin={Math.round(min)}
      aria-valuemax={Math.round(max)}
      aria-disabled={disabled || undefined}
      data-resize-handle=""
      data-dragging={dragging ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={cn(s.handle(), className)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => {
        onPointerUp?.(e);
        endDrag(e);
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e);
        endDrag(e);
      }}
      {...props}
    >
      {withHandle && (
        <span className={s.grip()} aria-hidden>
          <Grip size={10} />
        </span>
      )}
    </div>
  );
}
