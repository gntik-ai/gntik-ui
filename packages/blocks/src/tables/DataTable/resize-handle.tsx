import { cn } from '@gntik-ai/ui';
import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

export interface ColumnResizeHandleProps {
  /** Column name for the accessible label ("Resize Region column"). */
  label: string;
  width: number;
  min: number;
  max: number;
  onResize: (width: number) => void;
  /** Called once a drag or a key press ends a resize. */
  onResizeEnd?: (width: number) => void;
}

const STEP = 10;
const BIG_STEP = 50;

/**
 * Column resize handle at the end edge of a header cell: a focusable `role="separator"` with
 * aria-valuenow/min/max (the width in px). Drag it with a pointer; from the keyboard,
 * ArrowLeft/ArrowRight change the width by 10px (Shift: 50px), Home/End jump to the limits.
 */
export function ColumnResizeHandle({ label, width, min, max, onResize, onResizeEnd }: ColumnResizeHandleProps) {
  const drag = useRef<{ x: number; width: number; dir: 1 | -1 } | null>(null);
  const clamp = (w: number) => Math.round(Math.min(max, Math.max(min, w)));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rtl = typeof getComputedStyle === 'function' && getComputedStyle(e.currentTarget).direction === 'rtl';
    drag.current = { x: e.clientX, width, dir: rtl ? -1 : 1 };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    onResize(clamp(d.width + (e.clientX - d.x) * d.dir));
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d) onResizeEnd?.(clamp(d.width + (e.clientX - d.x) * d.dir));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? BIG_STEP : STEP;
    const rtl = typeof getComputedStyle === 'function' && getComputedStyle(e.currentTarget).direction === 'rtl';
    const grow = rtl ? 'ArrowLeft' : 'ArrowRight';
    const shrink = rtl ? 'ArrowRight' : 'ArrowLeft';
    let next: number | null = null;
    if (e.key === grow || e.key === 'ArrowUp') next = width + step;
    else if (e.key === shrink || e.key === 'ArrowDown') next = width - step;
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    if (next == null) return;
    e.preventDefault();
    const w = clamp(next);
    onResize(w);
    onResizeEnd?.(w);
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={`${width} pixels`}
      data-column-resizer=""
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        'group/resizer absolute inset-y-0 -end-1.5 z-[2] flex w-3 cursor-col-resize touch-none justify-center',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
      )}
    >
      <span
        aria-hidden
        className="my-2 w-px bg-border transition-colors group-hover/resizer:w-0.5 group-hover/resizer:bg-primary group-focus-visible/resizer:w-0.5 group-focus-visible/resizer:bg-primary motion-reduce:transition-none"
      />
    </div>
  );
}
