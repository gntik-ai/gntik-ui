import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Textarea',
  group: 'Forms',
  status: 'stable',
  description:
    'Multi-line text input with auto, sm, md and lg sizes, with optional autosize (native field-sizing: content with a measured script fallback where unsupported) and vertical resize. Renders through Base UI Field.Control, so it works inside Field. `minRows` and `maxRows` optionally bound autosize by content lines plus padding and border; maxRows scrolls overflow. Without minRows the minimum stays 88px, and without maxRows growth is unbounded. Positive finite bounds only; minRows is clamped to maxRows when greater. Bounds are ignored without autosize, and rows remains ignored with autosize. The fallback measures on mount, typing and controlled value replacement; native support sets no inline height. See TextareaAutosizeBounded for bounded prompts and controlled updates. Opt-in `clearable` reserves space for a reset button and returns focus to the textarea. `onClear` runs after the value change; `clearLabel` overrides the localized name. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. Size auto (default) uses density field padding: 12px comfortable and 10px compact, with 13px text and 24px line height. Textarea height follows its rows; it is not a single-line control. Explicit sm/md stay fixed; lg uses 14.5px text, 24px line height and 16px horizontal padding. See Input FieldSizes for every size and density.',
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
