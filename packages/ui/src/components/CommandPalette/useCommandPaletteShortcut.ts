import { useEffect, useRef } from 'react';

export interface CommandPaletteShortcutOptions {
  /** Letter pressed with ⌘ (macOS) or Ctrl. */
  key?: string;
  enabled?: boolean;
}

/** Calls `onTrigger` on ⌘K / Ctrl+K anywhere in the document (and prevents the browser default). */
export function useCommandPaletteShortcut(onTrigger: () => void, { key = 'k', enabled = true }: CommandPaletteShortcutOptions = {}) {
  const handler = useRef(onTrigger);
  useEffect(() => {
    handler.current = onTrigger;
  });
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        handler.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [key, enabled]);
}
