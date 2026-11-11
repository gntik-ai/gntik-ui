import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Input',
  group: 'Forms',
  status: 'stable',
  description:
    'Single-line text input with auto, sm, md and lg sizes with optional leading/trailing icons and addons (prefixes, units, keyboard hints, icon buttons). Invalid, disabled and read-only states; works inside Field. Opt-in `clearable` adds a labelled reset button; `clearOnEscape` consumes Escape only while the editable input has text. `onClear` runs after the value change and `clearLabel` overrides the localized name. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. Size auto follows density (36px comfortable, 32px compact); explicit sm/md stay fixed. Size lg stays 44px with 14.5px text in either density. See Input FieldSizes for a live comparison. Large field icons and steppers are 17px; popup metrics are unchanged. At lg, InputKbd is 22px tall and implicit IconButton and icon CopyButton addons use md (36px); explicit addon sizes win. Standalone addons and all other Input sizes keep their current metrics. See InputLargeAddons. Opt-in `showCount` adds a visible aria-hidden counter and a localized accessible count description. `maxCount` is a soft limit that takes precedence over native `maxLength`; maxLength stays on the control and still blocks typing. Without either limit, only the count is shown. `countStrategy` replaces UTF-16 value.length, for example with UTF-8 byte counting. Over-limit text uses destructive-text and sets data-over-limit on the control without setting aria-invalid. Polite warnings announce only a new warning (80%) or over-limit zone after a 500ms typing pause, never on mount. The counter sits inside the frame before trailingAddon, the clear button and trailingIcon. See InputCounter for a service name with maxLength={63} and an unlimited alias.',
  primitive: '@base-ui/react/input',
  pattern: 'textbox',
  keyboard: [
    ['Escape', 'With clearOnEscape and non-empty editable text: clears and stops propagation; otherwise propagates'],
    ['Tab', 'Moves focus into the input; trailing addon buttons follow in tab order'],
    ['Click on label', 'Inside a Field, focuses the input'],
  ],
  dataAttributes: [
    ['data-over-limit', 'input', 'The displayed count exceeds its maximum.'],
    ['data-invalid', 'root', 'The control value is invalid.'],
    ['data-invalid', 'input', 'The control value is invalid.'],
  ],
  tokens: [
    'background',
    'border',
    'foreground',
    'muted-foreground',
    'primary',
    'destructive',
    'destructive-text',
    'secondary',
    'focus-ring',
  ],
};
