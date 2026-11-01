import { useHotkeys } from '../../hooks/useHotkeys';

export interface CommandPaletteShortcutOptions {
  /** Letter pressed with ⌘ (macOS/iOS) or Ctrl (other platforms). */
  key?: string;
  enabled?: boolean;
}

/** Calls `onTrigger` on the platform's command key + K and prevents the browser default. */
export function useCommandPaletteShortcut(
  onTrigger: () => void,
  { key = 'k', enabled = true }: CommandPaletteShortcutOptions = {},
) {
  useHotkeys({ [`mod+${key}`]: { handler: onTrigger, description: 'Open the command palette' } }, { enabled });
}
