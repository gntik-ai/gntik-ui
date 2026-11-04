import type { UrlHistoryMode } from './url-param';

/**
 * Memoize adapters for their lifetime. setSearch must update getSearch synchronously.
 * Notify on navigation and commits; an older own commit must retain the latest requested search.
 */
export interface UrlStateAdapter {
  getSearch(): string;
  subscribe(onChange: () => void): () => void;
  setSearch(search: string, mode: UrlHistoryMode): void;
}

// No browser reads or listeners until a hook uses the adapter.
export const browserAdapter: UrlStateAdapter = {
  getSearch: () => (typeof window === 'undefined' ? '' : window.location.search),
  subscribe(onChange) {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  },
  setSearch(search, mode) {
    if (typeof window === 'undefined') return;
    window.history[mode === 'push' ? 'pushState' : 'replaceState'](
      window.history.state,
      '',
      window.location.pathname + search + window.location.hash,
    );
  },
};

const stores = new WeakMap<UrlStateAdapter, ReturnType<typeof createStore>>();
function createStore(adapter: UrlStateAdapter) {
  const listeners = new Set<() => void>();
  let pending: string | undefined;
  let lastWritten: string | undefined;
  let historyMode: UrlHistoryMode = 'replace';
  let pathname: string | undefined;
  const currentPath = () =>
    adapter === browserAdapter && typeof window !== 'undefined' ? window.location.pathname : undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let unsubscribe: (() => void) | undefined;
  const notify = () => listeners.forEach((listener) => listener());
  const cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
    lastWritten = undefined;
    historyMode = 'replace';
  };
  return {
    getSearch: () => {
      // Keep the timer alive so it can notify every consumer outside React's render phase.
      if (pending !== undefined && pathname !== currentPath()) return adapter.getSearch();
      return pending ?? adapter.getSearch();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1)
        unsubscribe = adapter.subscribe(() => {
          // Router commits can acknowledge our previous write while newer input is pending.
          // Browser popstate always represents navigation, even when the search is unchanged.
          if (adapter === browserAdapter || adapter.getSearch() !== lastWritten) cancel();
          notify();
        });
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          unsubscribe?.();
          unsubscribe = undefined;
          cancel();
        }
      };
    },
    setSearch(search: string, mode: UrlHistoryMode, throttleMs: number) {
      if (pending !== undefined && pathname !== currentPath()) cancel();
      if (pending === undefined) pathname = currentPath();
      pending = search;
      if (mode === 'push') historyMode = 'push';
      notify();
      if (timer !== undefined) return;
      timer = setTimeout(
        () => {
          timer = undefined;
          if (pathname !== currentPath()) {
            cancel();
            notify();
            return;
          }
          const next = pending;
          if (next === undefined) return;
          if (next === adapter.getSearch()) {
            pending = undefined;
            historyMode = 'replace';
            notify();
            return;
          }
          const writeMode = historyMode;
          const previousWritten = lastWritten;
          lastWritten = next;
          try {
            adapter.setSearch(next, writeMode);
            pending = undefined;
            historyMode = 'replace';
          } catch {
            lastWritten = previousWritten;
            /* SecurityError: retain the shared in-memory snapshot until navigation. */
          }
          notify();
        },
        Math.max(0, throttleMs),
      );
    },
  };
}
export function getUrlStore(adapter: UrlStateAdapter) {
  let store = stores.get(adapter);
  if (!store) {
    store = createStore(adapter);
    stores.set(adapter, store);
  }
  return store;
}
