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
  tokens: ['card', 'border', 'secondary', 'foreground', 'muted-foreground', 'primary', 'focus-ring'],
};
