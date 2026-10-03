import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Textarea',
  group: 'Forms',
  status: 'stable',
  description: 'Multi-line text input in two sizes, with optional CSS autosize (field-sizing: content) and vertical resize. Renders through Base UI Field.Control, so it works inside Field.',
  primitive: '@base-ui/react/field (Field.Control)',
  pattern: 'textbox (multi-line)',
  keyboard: [
    ['Tab', 'Moves focus into and out of the textarea'],
    ['Enter', 'Inserts a new line (does not submit the form)'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'primary', 'destructive', 'secondary', 'focus-ring'],
};
