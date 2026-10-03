import { useCallback, useMemo, useReducer, useSyncExternalStore, type FocusEvent } from 'react';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReduced(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener?.('change', onChange);
  return () => mq.removeEventListener?.('change', onChange);
}
const getReduced = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(REDUCED_QUERY).matches : false);

/** `true` when the user asks for reduced motion (false on the server). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, getReduced, () => false);
}

export interface UseLiveSeriesOptions<T> {
  /** Points shown before the first `append`. */
  initial?: readonly T[];
  /** Points kept (oldest drop off). Default 60. */
  windowSize?: number;
  /** Freeze the plotted data while the pointer is over the chart or focus is inside it (default true). */
  pauseOnInteraction?: boolean;
}

export interface LiveSeriesPauseProps {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onFocus: () => void;
  onBlur: (e: FocusEvent<HTMLElement>) => void;
}

export interface LiveSeries<T> {
  /** The data to plot: frozen while paused, the latest window otherwise. */
  data: readonly T[];
  /** Appends one point or several (keeps the last `windowSize`). Buffered while paused. */
  append: (points: T | readonly T[]) => void;
  /** Replaces every point. */
  reset: (points?: readonly T[]) => void;
  /** Paused by interaction (hover/focus) or by `pause()`. */
  paused: boolean;
  /** Paused with `pause()` / `togglePaused()` (a visible Pause button — WCAG 2.2.2). */
  manuallyPaused: boolean;
  pause: () => void;
  resume: () => void;
  togglePaused: () => void;
  /** Points received while paused, shown on resume. */
  pending: number;
  /** The user prefers reduced motion: render updates without animation. */
  reducedMotion: boolean;
  /** Spread on the element wrapping the chart to pause on hover and focus. */
  pauseProps: LiveSeriesPauseProps;
}

interface LiveState<T> {
  live: T[];
  frozen: T[] | null;
  pending: number;
  hover: boolean;
  focus: boolean;
  manual: boolean;
}

type LiveAction<T> =
  | { type: 'append'; points: readonly T[]; size: number }
  | { type: 'reset'; points: readonly T[]; size: number }
  | { type: 'flag'; flag: 'hover' | 'focus' | 'manual'; on: boolean };

function reducer<T>(state: LiveState<T>, action: LiveAction<T>): LiveState<T> {
  const paused = state.hover || state.focus || state.manual;
  switch (action.type) {
    case 'append': {
      if (action.points.length === 0) return state;
      const live = [...state.live, ...action.points].slice(-action.size);
      return { ...state, live, pending: paused ? Math.min(action.size, state.pending + action.points.length) : 0 };
    }
    case 'reset': {
      const live = action.points.slice(-action.size);
      return { ...state, live, frozen: paused ? live : null, pending: 0 };
    }
    case 'flag': {
      if (state[action.flag] === action.on) return state;
      const next = { ...state, [action.flag]: action.on };
      const nowPaused = next.hover || next.focus || next.manual;
      if (nowPaused && !paused) return { ...next, frozen: state.live, pending: 0 };
      if (!nowPaused && paused) return { ...next, frozen: null, pending: 0 };
      return next;
    }
  }
}

/**
 * State for a live-updating chart: a sliding window of points, with updates frozen while the
 * user hovers or focuses the chart (so a tooltip or a value does not move under them) and a
 * manual pause. Render with `animate={!reducedMotion}` for smooth transitions only when the
 * user has not asked for reduced motion.
 */
export function useLiveSeries<T>({ initial = [], windowSize = 60, pauseOnInteraction = true }: UseLiveSeriesOptions<T> = {}): LiveSeries<T> {
  const size = Math.max(1, Math.floor(windowSize));
  const [state, dispatch] = useReducer(reducer<T>, initial, (init): LiveState<T> => ({
    live: init.slice(-size),
    frozen: null,
    pending: 0,
    hover: false,
    focus: false,
    manual: false,
  }));
  const reducedMotion = usePrefersReducedMotion();
  const append = useCallback(
    (points: T | readonly T[]) => dispatch({ type: 'append', points: Array.isArray(points) ? (points as readonly T[]) : [points as T], size }),
    [size],
  );
  const reset = useCallback((points: readonly T[] = []) => dispatch({ type: 'reset', points, size }), [size]);
  const pause = useCallback(() => dispatch({ type: 'flag', flag: 'manual', on: true }), []);
  const resume = useCallback(() => dispatch({ type: 'flag', flag: 'manual', on: false }), []);
  const pauseProps = useMemo<LiveSeriesPauseProps>(
    () => ({
      onPointerEnter: () => pauseOnInteraction && dispatch({ type: 'flag', flag: 'hover', on: true }),
      onPointerLeave: () => dispatch({ type: 'flag', flag: 'hover', on: false }),
      onFocus: () => pauseOnInteraction && dispatch({ type: 'flag', flag: 'focus', on: true }),
      onBlur: (e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        dispatch({ type: 'flag', flag: 'focus', on: false });
      },
    }),
    [pauseOnInteraction],
  );
  const paused = state.hover || state.focus || state.manual;
  return {
    data: paused && state.frozen ? state.frozen : state.live,
    append,
    reset,
    paused,
    manuallyPaused: state.manual,
    pause,
    resume,
    togglePaused: state.manual ? resume : pause,
    pending: state.pending,
    reducedMotion,
    pauseProps,
  };
}
