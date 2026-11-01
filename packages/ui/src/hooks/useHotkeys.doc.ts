import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'Hotkeys',
  group: 'Actions',
  status: 'stable',
  description:
    'useHotkeys(map, { ref, enabled = true, sequenceTimeout = 1000 }) registers combinations (mod+k), sequences (g d) and comma-space alternatives (j, arrowdown) on one shared document keydown listener. Import useHotkeys, useRegisteredHotkeys and setCharacterHotkeysEnabled from @gntik-ai/ui. mod resolves at event time to Meta on macOS/iOS, Ctrl elsewhere; modifiers match exactly, with Shift ignored for symbol keys. Non-Latin and Option input falls back to physical Key/Digit codes. Definitions accept handler, description, group, enabled, preventDefault (true), ignoreWhileTyping (true for character bindings) and repeat (false). Character bindings skip inputs, editable content, menus, listboxes and trees. All bindings skip IME and already-prevented events. Ref scopes require focus inside the element and win over globals; the latest mount wins ties. Global characters are suppressed inside modal dialogs. Apps should expose a setting calling setCharacterHotkeysEnabled(false) to disable global character shortcuts for WCAG 2.1.4, and true to restore them; command combinations and scopes remain active. useRegisteredHotkeys returns stable external-store snapshots of mounted entries, with hotkey, keys, then, description and group, assignable to the shortcut-sheet shape except for id. Inline handlers stay fresh without listener churn. Server rendering attaches no listeners and lists no entries. The example shows slash search, G then D feedback, Option+P and the platform command palette, alongside the live registry.',
  keyboard: [
    ['mod+K', 'Toggles the command palette using the platform command key'],
    ['/', 'Focuses search outside typing controls and modals'],
    ['G then D', 'Updates feedback within 1000 ms between steps'],
    ['Alt+P', 'Updates feedback even when Option changes the produced character'],
  ],
};
