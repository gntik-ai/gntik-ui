import { useCallback, useSyncExternalStore } from 'react';

interface QueryStore {
  mql: MediaQueryList;
  listeners: Set<() => void>;
  notify: () => void;
}

const queries = new Map<string, QueryStore>();

function getStore(query: string): QueryStore | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  let store = queries.get(query);
  if (!store) {
    const listeners = new Set<() => void>();
    store = { mql: window.matchMedia(query), listeners, notify: () => listeners.forEach((listener) => listener()) };
    queries.set(query, store);
  }
  return store;
}

/**
 * Follow a CSS media query using a shared browser subscription. Returns `fallback`
 * on the server, during initial hydration and when matchMedia is unavailable.
 * Prefer CSS for layout; use this hook for behaviour that CSS cannot express.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (listener: () => void) => {
      const store = getStore(query);
      if (!store) return () => {};
      const { mql, listeners, notify } = store;
      if (listeners.size === 0) {
        if (typeof mql.addEventListener === 'function') mql.addEventListener('change', notify);
        else mql.addListener(notify);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', notify);
          else mql.removeListener(notify);
          queries.delete(query);
        }
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => getStore(query)?.mql.matches ?? fallback,
    () => fallback,
  );
}

/** Follow the user's reduced-motion preference; false on the server and during hydration. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
