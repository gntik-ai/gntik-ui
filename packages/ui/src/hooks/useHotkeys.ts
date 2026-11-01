import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import {
  getHotkeySnapshot,
  getServerHotkeySnapshot,
  refreshHotkeys,
  registerHotkeys,
  subscribeHotkeys,
} from './hotkey-registry';

export { setCharacterHotkeysEnabled, type RegisteredHotkey } from './hotkey-registry';

/** Receives the original document keydown event. */
export type HotkeyHandler = (event: KeyboardEvent) => void;

/** Behavior and shortcut-sheet metadata for a binding. */
export interface HotkeyDefinition {
  handler: HotkeyHandler;
  description?: string;
  group?: string;
  enabled?: boolean;
  /** Defaults to true. */
  preventDefault?: boolean;
  /** Defaults to true for bindings without mod, ctrl, meta or alt. */
  ignoreWhileTyping?: boolean;
  /** Allow repeated keydowns while a key is held. Defaults to false. */
  repeat?: boolean;
}

export interface UseHotkeysOptions {
  ref?: RefObject<HTMLElement | null>;
  enabled?: boolean;
  /** Maximum milliseconds between steps. Defaults to 1000. */
  sequenceTimeout?: number;
}

export type HotkeyMap = Record<string, HotkeyHandler | HotkeyDefinition>;

/**
 * Register combinations (`mod+k`), sequences (`g d`) or alternatives (`j, arrowdown`).
 * All mounted hooks share one document listener; handlers remain fresh without re-registering.
 * `mod` resolves to Meta on macOS/iOS and Ctrl elsewhere at event time.
 */
export function useHotkeys(hotkeys: HotkeyMap, options: UseHotkeysOptions = {}): void {
  const state = useRef({ hotkeys, options });
  const metadata = useRef('');
  useEffect(() => {
    state.current = { hotkeys, options };
    const signature = JSON.stringify(
      Object.entries(hotkeys).map(([source, value]) => [
        source,
        typeof value === 'function' ? undefined : value.description,
        typeof value === 'function' ? undefined : value.group,
      ]),
    );
    // Handler/options updates stay local; only binding or metadata changes rebuild the store.
    if (signature !== metadata.current) {
      metadata.current = signature;
      refreshHotkeys();
    }
  });
  useEffect(() => registerHotkeys(() => state.current), []);
}

/** List mounted bindings and their display keys using a stable, SSR-safe external-store snapshot. */
export function useRegisteredHotkeys() {
  return useSyncExternalStore(subscribeHotkeys, getHotkeySnapshot, getServerHotkeySnapshot);
}
