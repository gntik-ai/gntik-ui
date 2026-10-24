import { vi } from 'vitest';

/** Controllable browser boundary; rem queries use the browser's default 16px basis. */
export function mockMediaQueries(initialWidth = 1280, initialReducedMotion = false, legacy = false) {
  let width = initialWidth;
  let reducedMotion = initialReducedMotion;
  const lists: Array<{ mql: MediaQueryList; listeners: Set<() => void> }> = [];
  const matches = (query: string) => {
    if (query === '(prefers-reduced-motion: reduce)') return reducedMotion;
    const minimum = /min-width: ([\d.]+)(rem|px)/.exec(query);
    return minimum ? width >= Number(minimum[1]) * (minimum[2] === 'rem' ? 16 : 1) : false;
  };
  const matchMedia = vi.fn((query: string): MediaQueryList => {
    const listeners = new Set<() => void>();
    const add = (_event: string, listener: () => void) => {
      listeners.add(listener);
    };
    const remove = (_event: string, listener: () => void) => {
      listeners.delete(listener);
    };
    const mql = {
      get matches() {
        return matches(query);
      },
      media: query,
      onchange: null,
      addEventListener: legacy ? undefined : add,
      removeEventListener: legacy ? undefined : remove,
      addListener: (listener: () => void) => listeners.add(listener),
      removeListener: (listener: () => void) => listeners.delete(listener),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
    lists.push({ mql, listeners });
    return mql;
  });
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    matchMedia,
    lists,
    change(nextWidth: number, nextReducedMotion = reducedMotion) {
      width = nextWidth;
      reducedMotion = nextReducedMotion;
      for (const { listeners } of lists) for (const notify of listeners) notify();
    },
  };
}
