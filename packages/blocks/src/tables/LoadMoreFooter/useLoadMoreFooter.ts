import { useAnnounce } from '@gntik-ai/ui';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/** Capture focus before React removes the control, then restore it after the replacement commits. */
export function useLoadMoreFooter(
  control: 'button' | 'retry' | 'none',
  target: 'summary' | 'root',
  loading: boolean,
  error: string,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const currentControl = useRef<HTMLElement | null>(null);
  const moveFocus = useRef(false);
  const inFlightCursorRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    // A successful settle releases the cursor; later external failures use nextCursor.
    if (!loading && !error) inFlightCursorRef.current = undefined;
  }, [loading, error]);
  const controlRef = useCallback((node: HTMLElement | null) => {
    if (!node && currentControl.current?.contains(document.activeElement)) moveFocus.current = true;
    currentControl.current = node;
  }, []);

  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    const nextControl = currentControl.current;
    const next = nextControl?.matches('button') ? nextControl : nextControl?.querySelector('button');
    (next ?? (target === 'root' ? rootRef.current : summaryRef.current))?.focus();
  }, [control, target]);

  return { rootRef, summaryRef, controlRef, inFlightCursorRef };
}

/** Track committed results; mounting and intermediate loading states remain silent. */
export function useLoadMoreAnnouncements(
  loading: boolean,
  error: string,
  lastAppend: { seq: number; count: number } | undefined,
  loadedAnnouncement: (count: number) => string,
) {
  const announce = useAnnounce();
  const previous = useRef({ loading, error });
  const lastSeq = useRef(lastAppend?.seq);
  useEffect(() => {
    const before = previous.current;
    previous.current = { loading, error };
    if (!loading && error && (before.loading || before.error !== error)) announce(error, 'assertive');
  }, [loading, error, announce]);
  useEffect(() => {
    if (!lastAppend || (lastSeq.current !== undefined && lastAppend.seq <= lastSeq.current)) return;
    lastSeq.current = lastAppend.seq;
    if (lastAppend.count > 0) announce(loadedAnnouncement(lastAppend.count), 'polite');
  }, [lastAppend, loadedAnnouncement, announce]);
}
