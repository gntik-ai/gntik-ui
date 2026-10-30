import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Checkbox',
  group: 'Forms',
  status: 'stable',
  description:
    'Checkbox with optional label and description, including the indeterminate state. CheckboxGroup shares state across several checkboxes (plain or bordered list layout) and supports a parent "select all" checkbox. An explicit aria-label takes precedence over the visible label; keep both consistent for WCAG 2.5.3 (label in name).',
  primitive: '@base-ui/react/checkbox, @base-ui/react/checkbox-group',
  pattern: 'checkbox (dual and mixed state)',
  keyboard: [
    ['Space', 'Toggles the focused checkbox; a parent checkbox ticks or clears the whole group'],
    ['Tab', 'Moves focus to the next checkbox (each checkbox is a tab stop)'],
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
