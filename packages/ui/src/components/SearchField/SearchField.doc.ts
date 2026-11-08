import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'SearchField',
  group: 'Forms',
  status: 'stable',
  description:
    'Search input: a thin preset of Input with type="search", a decorative leading search icon, a clear button and Escape-to-clear (Input `clearable` and `clearOnEscape`, both on by default). The name comes from `aria-label`, `aria-labelledby` or a Field/FormField label, and is `Search` otherwise; the placeholder defaults to the catalog `Search…`. `onValueChange(value)` runs on every keystroke. `onSearch(value, source)` reports a committed search: `enter`, `clear` (button or Escape, with an empty value) or, when `debounceMs` is set, `type` once typing has paused. A pending debounce is cancelled by Enter, a clear and unmount, and controlled value changes from the parent never call `onSearch`. `onClear` runs after a clear. Enter never blocks an enclosing form submit and is ignored during IME composition or when a consumer `onKeyDown` prevented it. `pending` replaces the search icon with a decorative Spinner and sets `aria-busy`; typing stays enabled. `shortcut` takes a single combination (`/`, `mod+k`; sequences are not supported because `aria-keyshortcuts` cannot express them): it focuses the field and selects its text, sets `aria-keyshortcuts` and shows an `aria-hidden` key hint while the field is empty and unfocused (`mod` resolves to the platform key). Character shortcuts such as `/` ignore keystrokes inside other inputs and, like every global character shortcut, inside an open modal, so a Dialog that holds a SearchField registers its own scoped `useHotkeys` binding; `setCharacterHotkeysEnabled(false)` disables them but does not hide the hint. Combinations with a modifier such as `mod+k` also fire while typing elsewhere and can collide with an app command palette binding. A disabled field does not respond to the shortcut. The native WebKit cancel button is hidden so every browser shows the kit clear button only. Other Input props (sizes `auto`, `sm`, `md`, `variant`, `aria-describedby`, `autoFocus`, `onKeyDown`) pass through. Inside a Field the label names the input; outside one, a native `<label>` loses to the default `aria-label`, so pass `aria-label` yourself.',
  primitive: '@base-ui/react/input',
  pattern: 'searchbox',
  keyboard: [
    ['Enter', 'Calls onSearch(value, "enter") and lets an enclosing form submit; ignored during IME composition'],
    [
      'Escape',
      'On a non-empty editable field: clears it, reports the clear and stops propagation; otherwise propagates so a Dialog closes',
    ],
    ['/ (shortcut)', 'With `shortcut`, focuses the field and selects its text from outside an editable element'],
    ['Tab', 'Moves focus into the input, then to the clear button while it shows'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'secondary', 'focus-ring'],
};
