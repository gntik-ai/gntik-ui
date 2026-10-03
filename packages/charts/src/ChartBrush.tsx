import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { cx } from './format';
import { legendFocus } from './ChartLegend';

/** Inclusive `[start, end]` indices into the chart data. */
export type ChartRange = readonly [number, number];

/** Clamps a range to `[0, length - 1]`, ordered, at least `minSpan` points wide when possible. */
export function clampRange(range: ChartRange | null | undefined, length: number, minSpan = 1): [number, number] {
  const last = Math.max(0, length - 1);
  if (!range) return [0, last];
  let start = Math.round(Math.min(range[0], range[1]));
  let end = Math.round(Math.max(range[0], range[1]));
  start = Math.min(Math.max(0, start), last);
  end = Math.min(Math.max(0, end), last);
  const span = Math.min(minSpan, last);
  if (end - start < span) {
    if (start + span <= last) end = start + span;
    else start = Math.max(0, end - span);
  }
  return [start, end];
}

export interface UseChartRangeOptions {
  length: number;
  range?: ChartRange;
  defaultRange?: ChartRange;
  onRangeChange?: (range: ChartRange) => void;
}

/** Controlled/uncontrolled brush range; `null` inner state means "everything". */
export function useChartRange({ length, range, defaultRange, onRangeChange }: UseChartRangeOptions) {
  const [inner, setInner] = useState<ChartRange | null>(defaultRange ?? null);
  const current = clampRange(range ?? inner, length);
  const set = (next: ChartRange) => {
    const clamped = clampRange(next, length);
    setInner(clamped);
    onRangeChange?.(clamped);
  };
  return [current, set] as const;
}

export interface ChartBrushProps {
  /** Number of data points. */
  length: number;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  /** Text of the x value at an index (handles' aria-valuetext and the range summary). */
  labelOf: (index: number) => string;
  /** Values of one series, drawn as a faint overview line inside the track. */
  preview?: readonly number[];
  /** Accessible name of the brush group. */
  label?: string;
  className?: string;
}

const thumbClass = cx(
  'absolute top-1/2 z-10 h-7 w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none rounded-sm border border-primary bg-card shadow-sm',
  'after:absolute after:inset-y-2 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-primary',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
);

function previewPath(values: readonly number[]): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((val, i) => `${i === 0 ? 'M' : 'L'}${((i / (values.length - 1)) * 100).toFixed(2)},${(36 - ((val - min) / span) * 32).toFixed(2)}`)
    .join(' ');
}

/**
 * Range brush under a time-series chart: two keyboard-accessible handles (`role="slider"`,
 * Arrow keys ±1, PageUp/PageDown ±10%, Home/End) and a draggable window to pan.
 */
export function ChartBrush({ length, range, onRangeChange, labelOf, preview, label = 'Zoom range', className }: ChartBrushProps) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ kind: 'start' | 'end' | 'window'; originIndex: number; originRange: ChartRange } | null>(null);
  const last = Math.max(1, length - 1);
  const [start, end] = range;
  const pct = (i: number) => `${(i / last) * 100}%`;
  const full = start === 0 && end === length - 1;
  const step = Math.max(1, Math.round(length / 10));

  const indexAt = (clientX: number) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.round(((clientX - rect.left) / rect.width) * last);
  };
  const begin = (e: ReactPointerEvent<HTMLElement>) => {
    const part = e.currentTarget.dataset.brushHandle ?? 'window';
    const kind = part === 'start' || part === 'end' ? part : 'window';
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { kind, originIndex: indexAt(e.clientX), originRange: range };
  };
  const move = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const i = indexAt(e.clientX);
    const [s0, e0] = d.originRange;
    if (d.kind === 'start') onRangeChange([Math.min(i, e0 - 1), e0]);
    else if (d.kind === 'end') onRangeChange([s0, Math.max(i, s0 + 1)]);
    else {
      const delta = Math.min(Math.max(i - d.originIndex, -s0), length - 1 - e0);
      onRangeChange([s0 + delta, e0 + delta]);
    }
  };
  const stop = () => {
    drag.current = null;
  };

  const onKey = (which: 'start' | 'end') => (e: KeyboardEvent<HTMLElement>) => {
    const value = which === 'start' ? start : end;
    const min = which === 'start' ? 0 : start + 1;
    const max = which === 'start' ? end - 1 : length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = value - 1;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = value + 1;
    else if (e.key === 'PageDown') next = value - step;
    else if (e.key === 'PageUp') next = value + step;
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    if (next == null) return;
    e.preventDefault();
    const clamped = Math.min(Math.max(next, min), max);
    onRangeChange(which === 'start' ? [clamped, end] : [start, clamped]);
  };

  const path = preview ? previewPath(preview) : '';
  const thumb = (which: 'start' | 'end') => {
    const value = which === 'start' ? start : end;
    return (
      <div
        role="slider"
        tabIndex={0}
        aria-label={which === 'start' ? 'Range start' : 'Range end'}
        aria-orientation="horizontal"
        aria-valuemin={which === 'start' ? 0 : start + 1}
        aria-valuemax={which === 'start' ? end - 1 : length - 1}
        aria-valuenow={value}
        aria-valuetext={labelOf(value)}
        data-brush-handle={which}
        className={thumbClass}
        style={{ left: pct(value) }}
        onKeyDown={onKey(which)}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
    );
  };

  if (length < 2) return null;
  return (
    <div role="group" aria-label={label} data-chart-brush="" className={cx('mt-3 px-1', className)}>
      <div ref={track} className="relative mx-1.5 h-10 rounded-md border border-border bg-secondary/30">
        {path && (
          <svg aria-hidden viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d={path} fill="none" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.6} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </svg>
        )}
        <div
          aria-hidden
          data-brush-window=""
          className="absolute inset-y-0 cursor-grab touch-none border-y border-primary/60 bg-primary/14 active:cursor-grabbing"
          style={{ left: pct(start), width: `${((end - start) / last) * 100}%` }}
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
        />
        {thumb('start')}
        {thumb('end')}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11.5px] text-muted-foreground">
        <span className="font-mono tabular-nums">
          {labelOf(start)} – {labelOf(end)}
        </span>
        {!full && (
          <button
            type="button"
            onClick={() => onRangeChange([0, length - 1])}
            className={cx('px-1 font-medium text-foreground underline-offset-2 hover:underline', legendFocus)}
          >
            Reset zoom
          </button>
        )}
      </div>
    </div>
  );
}
