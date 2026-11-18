import { useEffect, useRef, useState } from 'react';

/**
 * Text that shows every keystroke at once but reports it once typing pauses for `delayMs`. With no delay
 * every change is reported at once. `flush` reports the pending text now, `replace` sets and reports a
 * text now and drops the pending one, and an unmount reports what is still pending. A `value` changed
 * from outside replaces the draft and the pending text.
 */
export function useDebouncedText(value: string, delayMs: number | undefined, onCommit: (text: string) => void) {
  const debounced = delayMs !== undefined && delayMs > 0;
  const [draft, setDraft] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<string | null>(null);
  const reported = useRef(value);
  const latest = useRef(onCommit);
  useEffect(() => {
    latest.current = onCommit;
  });

  const commit = (text: string) => {
    clearTimeout(timer.current);
    timer.current = undefined;
    pending.current = null;
    reported.current = text;
    latest.current(text);
  };
  useEffect(() => {
    if (value === reported.current) return;
    reported.current = value;
    clearTimeout(timer.current);
    timer.current = undefined;
    pending.current = null;
    setDraft(value);
  }, [value]);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (pending.current !== null) latest.current(pending.current);
    },
    [],
  );

  return {
    text: debounced ? draft : value,
    change: (next: string) => {
      if (!debounced) return commit(next);
      setDraft(next);
      clearTimeout(timer.current);
      // An emptied input reports at once, like a clear.
      if (next === '') return commit(next);
      pending.current = next;
      timer.current = setTimeout(() => commit(next), delayMs);
    },
    flush: () => {
      if (pending.current !== null) commit(pending.current);
    },
    replace: (next: string) => {
      setDraft(next);
      commit(next);
    },
  };
}
