import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'ToggleGroup',
  group: 'Actions',
  status: 'stable',
  description:
    'Toggle is a two-state (pressed) button; ToggleGroup sets Toggles side by side with shared state: a segmented control (single) or a toolbar of independent options (multiple). Segmented and joined looks, two sizes, icon-only items.',
  primitive: '@base-ui/react/toggle-group',
  pattern: 'toolbar-style group of toggle buttons (aria-pressed)',
  keyboard: [
    ['ArrowRight / ArrowLeft', 'Moves focus to the next / previous item (wraps)'],
    ['Home / End', 'Moves focus to the first / last item'],
    ['Space / Enter', 'Toggles the focused item'],
    ['Tab', 'Moves focus into and out of the group (one tab stop)'],
  ],
  anatomy: `<ToggleGroup aria-label="Options">
  <Toggle value="first">First</Toggle>
  <Toggle value="second">Second</Toggle>
</ToggleGroup>`,
  dataAttributes: [
    ['data-orientation', 'root', 'The attribute value specifies the horizontal or vertical orientation.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-pressed', 'root', 'The toggle is pressed.'],
  ],
  tokens: ['card', 'border', 'secondary', 'foreground', 'muted-foreground', 'primary', 'focus-ring'],
};
