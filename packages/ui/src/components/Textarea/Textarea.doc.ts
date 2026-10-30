import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Textarea',
  group: 'Forms',
  status: 'stable',
  description:
    'Multi-line text input in two sizes, with optional CSS autosize (field-sizing: content) and vertical resize. Renders through Base UI Field.Control, so it works inside Field. Opt-in `clearable` reserves space for a reset button and returns focus to the textarea. `onClear` runs after the value change; `clearLabel` overrides the localized name. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries.',
  primitive: '@base-ui/react/field (Field.Control)',
  pattern: 'textbox (multi-line)',
  keyboard: [
    ['Tab', 'Moves focus into and out of the textarea'],
    ['Enter', 'Inserts a new line (does not submit the form)'],
  ],
  dataAttributes: [['data-invalid', 'root', 'The control value is invalid.']],
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
