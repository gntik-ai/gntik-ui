import { getOs } from './useOs';

export interface HotkeyCombo {
  key: string;
  modifiers: string[];
}

export interface ParsedHotkey {
  hotkey: string;
  steps: HotkeyCombo[];
  keys: string[];
  then?: string[];
  character: boolean;
}

const aliases: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  space: ' ',
  plus: '+',
  control: 'ctrl',
  command: 'meta',
  option: 'alt',
};
const labels: Record<string, string> = {
  mod: 'mod',
  ctrl: 'Ctrl',
  meta: '⌘',
  alt: 'Alt',
  shift: '⇧',
  escape: 'Esc',
  enter: '↵',
  ' ': 'Space',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
};
const modifiers = new Set(['mod', 'ctrl', 'meta', 'alt', 'shift']);
const commandModifiers = new Set(['mod', 'ctrl', 'meta', 'alt']);

/** Parse comma-space alternatives, space-separated sequences and plus-separated combinations. */
export function parseHotkey(hotkey: string): ParsedHotkey[] {
  return hotkey
    .split(/,\s+/)
    .filter((value) => value.trim())
    .map((value) => {
      const steps = value
        .trim()
        .split(/\s+/)
        .map((step): HotkeyCombo => {
          const parts = step
            .toLowerCase()
            .split('+')
            .map((part) => aliases[part] ?? part);
          return { key: parts.at(-1) ?? '', modifiers: parts.slice(0, -1).filter((part) => modifiers.has(part)) };
        });
      const display = (combo: HotkeyCombo) =>
        [...combo.modifiers, combo.key].map((key) => labels[key] ?? key.toUpperCase());
      return {
        hotkey: value.trim(),
        steps,
        keys: display(steps[0]!),
        ...(steps[1] ? { then: display(steps[1]) } : {}),
        character: !steps.some((step) => step.modifiers.some((modifier) => commandModifiers.has(modifier))),
      };
    });
}

/** Match exact modifiers, resolving mod at event time and retaining physical layout fallbacks. */
export function matchesCombo(combo: HotkeyCombo, event: KeyboardEvent): boolean {
  const os = getOs();
  const expected = new Set(
    combo.modifiers.map((modifier) =>
      modifier === 'mod' ? (os === 'macos' || os === 'ios' ? 'meta' : 'ctrl') : modifier,
    ),
  );
  const symbol = combo.key.length === 1 && /[^a-z0-9\s]/i.test(combo.key);
  if (
    event.ctrlKey !== expected.has('ctrl') ||
    event.metaKey !== expected.has('meta') ||
    event.altKey !== expected.has('alt') ||
    (!symbol && event.shiftKey !== expected.has('shift'))
  )
    return false;
  const key = event.key.toLowerCase();
  if (key === combo.key) return true;
  if (event.altKey || (key.length === 1 && !/[a-z0-9\s\x21-\x7e]/i.test(key))) {
    const physical = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(event.code);
    return (physical?.[1] ?? physical?.[2])?.toLowerCase() === combo.key;
  }
  return false;
}
