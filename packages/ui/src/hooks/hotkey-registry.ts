import { matchesCombo, parseHotkey, type ParsedHotkey } from './parse-hotkey';
import type { HotkeyDefinition, HotkeyMap, UseHotkeysOptions } from './useHotkeys';

interface Binding {
  source: string;
  parsed: ParsedHotkey;
  progress: number;
  lastStep: number;
}
interface Registration {
  getState: () => { hotkeys: HotkeyMap; options: UseHotkeysOptions };
  signature: string;
  bindings: Binding[];
}

const registrations: Registration[] = [];
const subscribers = new Set<() => void>();

/** Shortcut-sheet entry; description is empty when a binding supplies no label. */
export interface RegisteredHotkey {
  hotkey: string;
  keys: string[];
  then?: string[];
  description: string;
  group?: string;
}

const emptySnapshot: readonly RegisteredHotkey[] = [];
let snapshot = emptySnapshot;
let characterHotkeysEnabled = true;
let warnedPrefixes = new Set<string>();

export const getHotkeySnapshot = () => snapshot;
export const getServerHotkeySnapshot = () => emptySnapshot;
export function subscribeHotkeys(listener: () => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

/** Disable global character shortcuts (WCAG 2.1.4); scoped shortcuts and command combos remain active. */
export function setCharacterHotkeysEnabled(enabled: boolean): void {
  if (characterHotkeysEnabled === enabled) return;
  characterHotkeysEnabled = enabled;
  for (const registration of registrations) {
    if (registration.getState().options.ref) continue;
    for (const binding of registration.bindings) {
      if (binding.parsed.character) binding.progress = 0;
    }
  }
}

function definition(registration: Registration, source: string): HotkeyDefinition | undefined {
  const value = registration.getState().hotkeys[source];
  return typeof value === 'function' ? { handler: value } : value;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || event.keyCode === 229) return;
  const target = event.target instanceof Element ? event.target : document.activeElement;
  const typing = target?.closest(
    'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="menu"], [role="listbox"], [role="tree"]',
  );
  // Base UI's modal popups expose dialog roles without an aria-modal attribute.
  const modalSelector = '[aria-modal="true"], [role="dialog"], [role="alertdialog"]';
  const modal = target?.closest(modalSelector) ?? document.activeElement?.closest(modalSelector);
  const matches: { value: HotkeyDefinition; scoped: boolean }[] = [];
  for (const registration of [...registrations].reverse()) {
    const { options } = registration.getState();
    const inScope = !options.ref || !!options.ref.current?.contains(document.activeElement);
    for (const binding of registration.bindings) {
      const value = definition(registration, binding.source);
      if (
        !value ||
        value.enabled === false ||
        options.enabled === false ||
        !inScope ||
        (binding.parsed.character &&
          ((typing && value.ignoreWhileTyping !== false) || (!options.ref && (modal || !characterHotkeysEnabled))))
      ) {
        binding.progress = 0;
        continue;
      }
      if (event.repeat && !value.repeat) continue;
      const now = Date.now();
      if (now - binding.lastStep > (options.sequenceTimeout ?? 1000)) binding.progress = 0;
      if (!matchesCombo(binding.parsed.steps[binding.progress]!, event)) binding.progress = 0;
      if (matchesCombo(binding.parsed.steps[binding.progress]!, event)) {
        binding.progress++;
        binding.lastStep = now;
        if (binding.progress === binding.parsed.steps.length) {
          binding.progress = 0;
          matches.push({ value, scoped: !!options.ref });
        }
      }
    }
  }
  const winner = matches.find((match) => match.scoped) ?? matches[0];
  if (winner) {
    if (winner.value.preventDefault !== false) event.preventDefault();
    winner.value.handler(event);
  }
}

export function refreshHotkeys() {
  for (const registration of registrations) {
    const sources = Object.keys(registration.getState().hotkeys);
    const signature = JSON.stringify(sources);
    if (signature !== registration.signature) {
      registration.signature = signature;
      registration.bindings = sources.flatMap((source) =>
        parseHotkey(source).map((parsed) => ({ source, parsed, progress: 0, lastStep: 0 })),
      );
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    const bindings = registrations.flatMap((registration) => registration.bindings);
    const prefix = (binding: Binding) => {
      const first = binding.parsed.steps[0]!;
      return JSON.stringify([first.key, [...first.modifiers].sort()]);
    };
    const singles = new Set(bindings.filter((binding) => binding.parsed.steps.length === 1).map(prefix));
    const conflicts = new Set(
      bindings.filter((binding) => binding.parsed.steps.length > 1 && singles.has(prefix(binding))).map(prefix),
    );
    for (const conflict of conflicts) {
      if (!warnedPrefixes.has(conflict))
        console.warn('useHotkeys: a single key also starts a sequence; the single fires immediately.', conflict);
    }
    warnedPrefixes = conflicts;
  }
  const next = registrations.flatMap((registration) =>
    registration.bindings.map(({ source, parsed }): RegisteredHotkey => {
      const value = definition(registration, source);
      return {
        hotkey: parsed.hotkey,
        keys: parsed.keys,
        ...(parsed.then ? { then: parsed.then } : {}),
        description: value?.description ?? '',
        ...(value?.group !== undefined ? { group: value.group } : {}),
      };
    }),
  );
  if (JSON.stringify(next) !== JSON.stringify(snapshot)) {
    snapshot = next;
    for (const subscriber of subscribers) subscriber();
  }
}

/** Called only by the hook's effect, so neither DOM nor navigator is read during SSR/render. */
export function registerHotkeys(getState: Registration['getState']): () => void {
  const registration: Registration = { getState, signature: '', bindings: [] };
  if (!registrations.length) document.addEventListener('keydown', onKeyDown);
  registrations.push(registration);
  refreshHotkeys();
  return () => {
    registrations.splice(registrations.indexOf(registration), 1);
    if (!registrations.length) document.removeEventListener('keydown', onKeyDown);
    refreshHotkeys();
  };
}
