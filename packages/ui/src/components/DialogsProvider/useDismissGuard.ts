import { useEffect, useMemo, useRef } from 'react';
import type { DialogsStore } from './dialogsStore';

/**
 * Base UI listens for Escape on the document in every open dialog, and dialogs that are not nested
 * in the React tree each believe they are topmost. The guard records which dialog was topmost when
 * the key went down, so only that one acts on it, whatever the order the listeners run in.
 */
export function useDismissGuard(store: DialogsStore) {
  const gesture = useRef<{ top: string | undefined } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      gesture.current = { top: store.top() };
      clearTimeout(timer);
      timer = setTimeout(() => {
        gesture.current = null;
      }, 0);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      clearTimeout(timer);
      gesture.current = null;
    };
  }, [store]);
  return useMemo(
    () => ({
      /** A dismissal request from `id` is honoured only while it is the topmost dialog. */
      canDismiss: (id: string) => (gesture.current ? gesture.current.top : store.top()) === id,
      /** A close request from a custom component is dropped only when a stray Escape reaches it. */
      canClose: (id: string) => !gesture.current || gesture.current.top === id,
    }),
    [store],
  );
}
