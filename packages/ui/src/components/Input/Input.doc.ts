import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Input',
  group: 'Forms',
  status: 'stable',
  description:
    'Single-line text input with auto, sm, md and lg sizes with optional leading/trailing icons and addons (prefixes, units, keyboard hints, icon buttons). Invalid, disabled and read-only states; works inside Field. Opt-in `clearable` adds a labelled reset button; `clearOnEscape` consumes Escape only while the editable input has text. `onClear` runs after the value change and `clearLabel` overrides the localized name. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. Size auto follows density (36px comfortable, 32px compact); explicit sm/md stay fixed. Size lg stays 44px with 14.5px text in either density. See Input FieldSizes for a live comparison. Large field icons and steppers are 17px; popup metrics are unchanged. At lg, InputKbd is 22px tall and implicit IconButton and icon CopyButton addons use md (36px); explicit addon sizes win. Standalone addons and all other Input sizes keep their current metrics. See InputLargeAddons.',
  primitive: '@base-ui/react/input',
  pattern: 'textbox',
  keyboard: [
    ['Escape', 'With clearOnEscape and non-empty editable text: clears and stops propagation; otherwise propagates'],
    ['Tab', 'Moves focus into the input; trailing addon buttons follow in tab order'],
    ['Click on label', 'Inside a Field, focuses the input'],
  ],
  dataAttributes: [
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
    'secondary',
    'focus-ring',
  ],
};
