// @gntik-ai/ui/hooks — the kit's behaviour hooks. Every name is also exported from the package root.
// Component hooks come from their source files, not the component barrels, so a bundle that
// imports one hook does not pull in the component's other modules.
export { useClipboard, type UseClipboardOptions } from './useClipboard';
export { useLocalStorage, useSessionStorage, readLocalStorageValue, type UseStorageOptions } from './useLocalStorage';
export { getOs, useOs, type Os } from './useOs';
export {
  useHotkeys,
  useRegisteredHotkeys,
  setCharacterHotkeysEnabled,
  type HotkeyHandler,
  type HotkeyDefinition,
  type HotkeyMap,
  type UseHotkeysOptions,
  type RegisteredHotkey,
} from './useHotkeys';
export { useMediaQuery, useReducedMotion, usePrefersReducedMotion } from './useMediaQuery';
export { useBreakpoint, useBreakpointValue, type BreakpointOptions } from './useBreakpoint';
export { useAnnounce, type Announce, type AnnouncePoliteness } from '../components/LiveAnnouncer/LiveAnnouncer';
export {
  useToast,
  type ToastOptions,
  type ToastPromiseOptions,
  type ToastPromiseState,
} from '../components/Toast/Toast';
export {
  useAsyncOptions,
  type LoadOptions,
  type UseAsyncOptionsConfig,
  type AsyncOptionsState,
} from '../components/Combobox/useAsyncOptions';
export { useFitCount } from '../components/OverflowList/useFitCount';
export { useVirtualWindow, type VirtualWindow } from '../components/VirtualList/use-virtual-window';
