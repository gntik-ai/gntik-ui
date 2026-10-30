import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'RadioGroup',
  group: 'Forms',
  status: 'stable',
  description:
    'Single choice from a short list. RadioGroup + Radio with optional label, description and trailing content per option, in plain, list (bordered rows) and card variants. An explicit aria-label takes precedence over the visible label; keep both consistent for WCAG 2.5.3 (label in name).',
  primitive: '@base-ui/react/radio-group, @base-ui/react/radio',
  pattern: 'radio group',
  keyboard: [
    ['Tab', 'Enters the group once, on the selected radio (or the first one); Tab again leaves the group'],
    ['Arrow Down / Arrow Right', 'Moves to the next radio and selects it (wraps)'],
    ['Arrow Up / Arrow Left', 'Moves to the previous radio and selects it (wraps)'],
    ['Space', 'Selects the focused radio if it is not already selected'],
  ],
  anatomy: `<RadioGroup aria-label="Options">
  <Radio value="first">First</Radio>
  <Radio value="second">Second</Radio>
</RadioGroup>`,
  dataAttributes: [
    ['data-checked', 'radio', 'The control is checked.'],
    ['data-invalid', 'radio', 'The control value is invalid.'],
    ['data-disabled', 'radio', 'The control cannot be changed or activated.'],
    ['data-unchecked', 'indicator', 'The control is unchecked.'],
    ['data-disabled', 'indicator', 'The control cannot be changed or activated.'],
    ['data-checked', 'item', 'The control is checked.'],
    ['data-disabled', 'item', 'The control cannot be changed or activated.'],
    ['data-disabled', 'label', 'The control cannot be changed or activated.'],
  ],
  tokens: [
    'background',
    'border',
    'primary',
    'primary-foreground',
    'foreground',
    'muted-foreground',
    'destructive',
    'focus-ring',
  ],
};
