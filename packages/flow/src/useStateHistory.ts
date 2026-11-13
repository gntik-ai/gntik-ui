import { useCallback, useEffect, useRef, useState } from 'react';

export interface StateHistoryOptions {
  /** Most values kept, the current one included; the oldest is dropped beyond it (default 100). */
  limit?: number;
}

export interface StateHistoryMeta {
  /** Names the step this `set` creates; `back()` and `forward()` return it when they cross the step. */
  label?: string;
  /** A `set` whose key equals the open batch's key replaces the top step instead of adding one. */
  coalesce?: string;
}

export interface StateHistory<T> {
  value: T;
  /** Every recorded value, oldest first; `values[index]` is `value`. */
  values: readonly T[];
  /** Records `next` as a new step and drops the redo steps. */
  set: (next: T, meta?: StateHistoryMeta) => void;
  /** Moves one step back; returns the label of the step it crossed (undefined at the start). */
  back: () => string | undefined;
  /** Moves one step forward; returns the label of the step it crossed (undefined at the end). */
  forward: () => string | undefined;
  /** Empties the history and keeps `value`, or the current value when omitted. */
  reset: (...args: [value?: T]) => void;
  index: number;
  length: number;
  canBack: boolean;
  canForward: boolean;
}

interface Step<T> {
  value: T;
  label?: string;
}

interface Timeline<T> {
  steps: Step<T>[];
  index: number;
  /** Coalesce key of the batch still open: only the step just written by `set` can absorb a merge. */
  open?: string;
}

const DEFAULT_LIMIT = 100;

/** A move's outcome: the value now current and the label of the step the move crossed. */
export interface TimelineMove<T> {
  value: T;
  label?: string;
}

/**
 * Timeline behind `useStateHistory`. It lives in a ref so several calls in one event see each other,
 * and `moved` hands back the value a move lands on, for callers that restore state synchronously.
 */
export function useTimeline<T>(initial: T, options: StateHistoryOptions = {}) {
  const limit = Math.max(1, Math.floor(options.limit ?? DEFAULT_LIMIT));
  const limitRef = useRef(limit);
  useEffect(() => {
    limitRef.current = limit;
  });
  // State renders; the ref mirrors it so several calls in one event build on each other.
  const [current, setCurrent] = useState<Timeline<T>>(() => ({ steps: [{ value: initial }], index: 0 }));
  const timeline = useRef(current);

  const commit = useCallback((next: Timeline<T>) => {
    timeline.current = next;
    setCurrent(next);
  }, []);

  const set = useCallback(
    (next: T, meta?: StateHistoryMeta) => {
      const { steps, index, open } = timeline.current;
      const key = meta?.coalesce;
      if (key !== undefined && key === open) {
        const merged: Step<T> = { value: next, label: meta?.label ?? steps[index]!.label };
        commit({ steps: [...steps.slice(0, index), merged], index, open: key });
        return;
      }
      const kept = [...steps.slice(0, index + 1), { value: next, label: meta?.label }];
      const trimmed = kept.slice(Math.max(0, kept.length - limitRef.current));
      commit({ steps: trimmed, index: trimmed.length - 1, open: key });
    },
    [commit],
  );

  const back = useCallback((): TimelineMove<T> | undefined => {
    const { steps, index, open } = timeline.current;
    if (index === 0) {
      // Even a move that goes nowhere closes the open batch.
      if (open !== undefined) commit({ steps, index });
      return undefined;
    }
    commit({ steps, index: index - 1 });
    return { value: steps[index - 1]!.value, label: steps[index]!.label };
  }, [commit]);

  const forward = useCallback((): TimelineMove<T> | undefined => {
    const { steps, index, open } = timeline.current;
    if (index >= steps.length - 1) {
      if (open !== undefined) commit({ steps, index });
      return undefined;
    }
    commit({ steps, index: index + 1 });
    return { value: steps[index + 1]!.value, label: steps[index + 1]!.label };
  }, [commit]);

  const reset = useCallback(
    (...args: [value?: T]) => {
      const { steps, index } = timeline.current;
      commit({ steps: [{ value: args.length === 0 ? steps[index]!.value : (args[0] as T) }], index: 0 });
    },
    [commit],
  );

  const { steps, index } = current;
  return {
    value: steps[index]!.value,
    values: steps.map((step) => step.value),
    set,
    back,
    forward,
    reset,
    index,
    length: steps.length,
    canBack: index > 0,
    canForward: index < steps.length - 1,
  };
}

/** Undo history of one value: `set` records a step, `back` and `forward` move between steps. */
export function useStateHistory<T>(initial: T, options: StateHistoryOptions = {}): StateHistory<T> {
  const { back, forward, ...timeline } = useTimeline(initial, options);
  const stepBack = useCallback(() => back()?.label, [back]);
  const stepForward = useCallback(() => forward()?.label, [forward]);
  return { ...timeline, back: stepBack, forward: stepForward };
}
