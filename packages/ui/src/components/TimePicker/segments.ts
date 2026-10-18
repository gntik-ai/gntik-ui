import { useRef, useState, type KeyboardEvent } from 'react';

interface SegmentOptions<K extends string, D, V> {
  value?: V;
  defaultValue: V;
  onValueChange?: (value: V) => void;
  toDraft: (value: V) => D;
  toValue: (draft: D) => V;
  keys: K[];
  display: (draft: D, key: K) => number | null;
  range: (key: K, draft: D) => [number, number];
  withSegment: (draft: D, key: K, value: number | null) => D;
  step?: (key: K) => number;
  /** Caller-owned nonnumeric segments, such as a time period. */
  character?: (key: K, character: string) => number | undefined;
  numeric?: (key: K) => boolean;
  equals?: (a: V, b: V) => boolean;
  typingRange?: (key: K, draft: D) => [number, number];
  digitCount?: (key: K) => number;
  deferDigits?: (key: K) => boolean;
  resetOnExternalChange?: boolean;
  notifyDraft?: (draft: D) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

/** Generic segmented draft, typing buffer, focus navigation and wrapping keyboard edits. */
export function useSegments<K extends string, D, V>(options: SegmentOptions<K, D, V>) {
  const { value, defaultValue, onValueChange, toDraft, toValue, keys, withSegment, disabled, readOnly } = options;
  const equals = options.equals ?? Object.is;
  const controlled = value !== undefined;
  const [draft, setDraft] = useState<D>(() => toDraft(controlled ? value : defaultValue));
  const [committedDraft, setCommittedDraft] = useState(draft);
  const [synced, setSynced] = useState(value);
  const [generation, setGeneration] = useState(0);
  if (controlled && !equals(value, synced as V)) {
    setSynced(value);
    if (options.resetOnExternalChange) setGeneration(generation + 1);
    setDraft(toDraft(value));
    setCommittedDraft(toDraft(value));
  }
  const buffer = useRef<{ key: K; text: string; generation: number } | null>(null);
  const pending = useRef<{ draft: D; previous: V; generation: number } | null>(null);
  const segmentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const current = toValue(draft);
  const display = (key: K) => options.display(draft, key);
  const range = (key: K) => options.range(key, draft);
  const stepFor = (key: K) => options.step?.(key) ?? 1;

  const commit = (next: D, previous = current) => {
    pending.current = null;
    setDraft(next);
    setCommittedDraft(next);
    const v = toValue(next);
    if (!equals(v, previous) || options.notifyDraft?.(next)) {
      if (controlled) setSynced(v);
      onValueChange?.(v);
    }
  };
  const flush = () => {
    const next = pending.current;
    if (next?.generation === generation) commit(next.draft, next.previous);
    else pending.current = null;
    buffer.current = null;
  };
  const focusSegment = (i: number) => {
    flush();
    buffer.current = null;
    segmentRefs.current[Math.max(0, Math.min(keys.length - 1, i))]?.focus();
  };
  const spin = (key: K, delta: number) => {
    const [lo, hi] = range(key);
    const cur = display(key);
    const stepSize = stepFor(key);
    const top = Math.floor(hi / stepSize) * stepSize;
    let next: number;
    if (cur === null) next = delta > 0 ? lo : top;
    else if (stepSize > 1)
      next = delta > 0 ? (Math.floor(cur / stepSize) + 1) * stepSize : (Math.ceil(cur / stepSize) - 1) * stepSize;
    else next = cur + delta;
    if (next > hi) next = lo;
    if (next < lo) next = top;
    commit(withSegment(draft, key, next));
  };
  const typeDigit = (key: K, index: number, digit: string) => {
    const [lo, hi] = options.typingRange?.(key, draft) ?? range(key);
    let text =
      (buffer.current?.key === key && buffer.current.generation === generation ? buffer.current.text : '') + digit;
    let n = Number(text);
    if (n > hi) {
      text = digit;
      n = Number(digit);
    }
    const digits = options.digitCount?.(key) ?? 2;
    const full = text.length >= digits || n * 10 > hi;
    const next = n >= lo ? withSegment(draft, key, n) : text.length >= digits ? withSegment(draft, key, hi) : null;
    if (next !== null) {
      if (options.deferDigits?.(key)) {
        pending.current = {
          draft: next,
          previous: pending.current?.generation === generation ? pending.current.previous : current,
          generation,
        };
        setDraft(next);
        if (full) flush();
      } else commit(next);
    }
    if (full) focusSegment(index + 1);
    else buffer.current = { key, text, generation };
  };
  const onKeyDown = (key: K, index: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let handled = true;
    if (e.key === 'ArrowLeft') focusSegment(index - 1);
    else if (e.key === 'ArrowRight') focusSegment(index + 1);
    else if (readOnly) handled = false;
    else if (e.key === 'ArrowUp') spin(key, 1);
    else if (e.key === 'ArrowDown') spin(key, -1);
    else if (e.key === 'Home') commit(withSegment(draft, key, range(key)[0]));
    else if (e.key === 'End') commit(withSegment(draft, key, Math.floor(range(key)[1] / stepFor(key)) * stepFor(key)));
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      buffer.current = null;
      commit(withSegment(draft, key, null));
    } else if ((options.numeric?.(key) ?? true) && /^\d$/.test(e.key)) typeDigit(key, index, e.key);
    else if (options.character && !(options.numeric?.(key) ?? true) && e.key.length === 1) {
      const n = options.character(key, e.key);
      if (n !== undefined) commit(withSegment(draft, key, n));
      else handled = false;
    } else if ((e.key === ':' || e.key === '.') && index < keys.length - 1) focusSegment(index + 1);
    else handled = false;
    if (handled) e.preventDefault();
  };
  return {
    draft,
    current,
    committedDraft,
    committed: toValue(committedDraft),
    display,
    range,
    commit,
    focusSegment,
    onKeyDown,
    buffer,
    segmentRefs,
    flush,
  };
}
