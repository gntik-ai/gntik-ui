import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Checkbox',
  group: 'Forms',
  status: 'stable',
  anatomy: `<CheckboxGroup aria-label="Options">
  <Checkbox value="option" label="Option" />
</CheckboxGroup>`,
  description:
    'Checkbox with optional label and description, including the indeterminate state. CheckboxGroup shares state across several checkboxes (plain or bordered list layout) and supports a parent "select all" checkbox. An explicit aria-label takes precedence over the visible label; keep both consistent for WCAG 2.5.3 (label in name).',
  primitive: '@base-ui/react/checkbox, @base-ui/react/checkbox-group',
  pattern: 'checkbox (dual and mixed state)',
  keyboard: [
    ['Space', 'Toggles the focused checkbox; a parent checkbox ticks or clears the whole group'],
    ['Tab', 'Moves focus to the next checkbox (each checkbox is a tab stop)'],
  ],
  dataAttributes: [
    ['data-checked', 'root', 'The control is checked.'],
    ['data-indeterminate', 'root', 'The control has a mixed or unknown value.'],
    ['data-invalid', 'root', 'The control value is invalid.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-unchecked', 'indicator', 'The control is unchecked.'],
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
