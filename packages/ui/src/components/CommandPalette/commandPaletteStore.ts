/** Opens and closes a CommandPalette from code outside its tree (e.g. a button in a page header). */
export interface CommandPaletteStore {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
  /** Calls `listener` after every change of the open state; returns the unsubscribe function. */
  subscribe: (listener: () => void) => () => void;
}

/** Creates a store to pass as `store` to a CommandPalette (or GlobalSearch). */
export function createCommandPaletteStore(): CommandPaletteStore {
  let isOpen = false;
  const listeners = new Set<() => void>();
  const set = (next: boolean) => {
    if (next === isOpen) return;
    isOpen = next;
    for (const listener of [...listeners]) listener();
  };
  return {
    open: () => set(true),
    close: () => set(false),
    toggle: () => set(!isOpen),
    isOpen: () => isOpen,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
