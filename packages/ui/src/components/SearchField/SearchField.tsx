import { Search } from 'lucide-react';
import { useContext, useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore, type Ref } from 'react';
import { useHotkeys } from '../../hooks/useHotkeys';
import { parseHotkey } from '../../hooks/parse-hotkey';
import { useOs, type Os } from '../../hooks/useOs';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { createFieldLabelStore, InFieldContext } from '../../utils/in-field-context';
import { Input, InputKbd, type InputProps } from '../Input';
import { Spinner } from '../Spinner';
import { searchFieldVariants } from './search-field.variants';

/** What committed a search: Enter, a clear (button or Escape), or typing that paused for `debounceMs`. */
export type SearchSource = 'enter' | 'clear' | 'type';

export interface SearchFieldProps extends Omit<
  InputProps,
  'type' | 'size' | 'value' | 'defaultValue' | 'onValueChange' | 'leadingIcon' | 'ref'
> {
  size?: 'auto' | 'sm' | 'md';
  value?: string;
  defaultValue?: string;
  ref?: Ref<HTMLInputElement>;
  /** Runs on every keystroke and on a clear. */
  onValueChange?: (value: string) => void;
  /** A committed search: Enter, a clear, or typing that paused for `debounceMs`. */
  onSearch?: (value: string, source: SearchSource) => void;
  /** Report typing as a `type` search once the user has paused for this many milliseconds. */
  debounceMs?: number;
  /** Results are loading: shows a spinner instead of the search icon and sets aria-busy. Typing stays enabled. */
  pending?: boolean;
  /** One key combination (`/`, `mod+k`) that focuses the field and selects its text. Sequences are not supported. */
  shortcut?: string;
}

const noLabels = createFieldLabelStore();

const isMac = (os: Os) => os === 'macos' || os === 'ios';

const ARIA_KEYS: Record<string, string> = {
  ctrl: 'Control',
  meta: 'Meta',
  alt: 'Alt',
  shift: 'Shift',
  escape: 'Escape',
  enter: 'Enter',
  ' ': 'Space',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
};

const MAC_SYMBOLS: Record<string, string> = { ctrl: '⌃', meta: '⌘', alt: '⌥', shift: '⇧' };
const PC_NAMES: Record<string, string> = { ctrl: 'Ctrl', meta: 'Win', alt: 'Alt', shift: 'Shift' };

/** The shortcut as an `aria-keyshortcuts` value and a visible hint, with `mod` resolved for the platform. */
function describeShortcut(shortcut: string, os: Os) {
  const combo = parseHotkey(shortcut)[0]?.steps[0];
  if (!combo) return undefined;
  const modifiers = combo.modifiers.map((modifier) => (modifier === 'mod' ? (isMac(os) ? 'meta' : 'ctrl') : modifier));
  const key = combo.key.length === 1 ? combo.key.toUpperCase() : (ARIA_KEYS[combo.key] ?? combo.key);
  const parts = [...modifiers.map((modifier) => (isMac(os) ? MAC_SYMBOLS : PC_NAMES)[modifier] ?? modifier), key];
  return {
    aria: [...modifiers.map((modifier) => ARIA_KEYS[modifier] ?? modifier), key].join('+'),
    hint: parts.join(isMac(os) ? '' : '+'),
  };
}

const PendingIcon = ({ size, className }: { size?: number; className?: string }) => (
  <Spinner size={size} className={className} />
);

/**
 * Search input: a preset of Input with a search icon, a clear button and Escape-to-clear (Input's `clearable`
 * and `clearOnEscape`), Enter and debounced typing reported through `onSearch`, a pending state and an optional
 * shortcut that focuses it. Works inside Field and FormField.
 */
export function SearchField({
  size = 'auto',
  value,
  defaultValue,
  ref,
  onValueChange,
  onSearch,
  onClear,
  debounceMs,
  pending = false,
  shortcut,
  placeholder,
  clearable = true,
  clearOnEscape = true,
  inputClassName,
  trailingAddon,
  onKeyDown,
  onFocus,
  onBlur,
  disabled: disabledProp,
  ...props
}: SearchFieldProps) {
  const field = useContext(InFieldContext);
  const disabled = disabledProp || field?.disabled;
  const { t } = useI18n();
  const os = useOs();
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  const [inner, setInner] = useState(defaultValue ?? '');
  const [focused, setFocused] = useState(false);
  const empty = (value ?? inner) === '';

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef(onSearch);
  useEffect(() => {
    latest.current = onSearch;
  });
  const cancel = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
  };
  useEffect(() => cancel, []);

  const described = shortcut && !disabled ? describeShortcut(shortcut, os) : undefined;
  useHotkeys(
    shortcut
      ? {
          [shortcut]: () => {
            inputRef.current?.focus();
            inputRef.current?.select();
          },
        }
      : {},
    { enabled: !disabled },
  );

  const hint =
    described && empty && !focused ? (
      <span aria-hidden>
        <InputKbd>{described.hint}</InputKbd>
      </span>
    ) : undefined;

  // aria-label outranks a native label, and Base UI wires a Field label only after hydration, so below a Field with
  // a label the default name is left to that label from the first (server) render on.
  const labels = field?.labels ?? noLabels;
  const fieldLabelled = useSyncExternalStore(labels.subscribe, labels.has, labels.has);
  const named = props['aria-label'] || props['aria-labelledby'] || fieldLabelled;

  return (
    <Input
      {...props}
      type="search"
      ref={inputRef}
      size={size}
      disabled={disabled}
      clearable={clearable}
      clearOnEscape={clearOnEscape}
      leadingIcon={pending ? PendingIcon : Search}
      trailingAddon={trailingAddon ?? hint}
      inputClassName={cn(searchFieldVariants().input(), inputClassName)}
      placeholder={placeholder ?? t('common.searchPlaceholder')}
      aria-label={named ? props['aria-label'] : t('common.search')}
      aria-busy={pending || undefined}
      aria-keyshortcuts={described?.aria}
      {...(value === undefined ? { defaultValue } : { value })}
      onValueChange={(next) => {
        setInner(next);
        onValueChange?.(next);
        if (debounceMs === undefined) return;
        cancel();
        timer.current = setTimeout(() => {
          timer.current = undefined;
          latest.current?.(next, 'type');
        }, debounceMs);
      }}
      onClear={() => {
        cancel();
        onClear?.();
        onSearch?.('', 'clear');
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key !== 'Enter' || event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229)
          return;
        cancel();
        onSearch?.(event.currentTarget.value, 'enter');
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
    />
  );
}
