import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'ThemeSwitcher',
  group: 'Theme',
  status: 'beta',
  description:
    'Theme control bound to useTheme(): a segmented Light · Dark · High contrast · System control (labels or icon-only), and ThemeCycleButton, a compact icon button that cycles modes for toolbars.',
  primitive: '@base-ui/react/toggle-group',
  pattern: 'toggle button group',
  keyboard: [
    ['Tab', 'Moves focus into the group and out of it'],
    ['ArrowRight / ArrowLeft', 'Moves focus between options (wraps)'],
    ['Enter / Space', 'Selects the focused option and applies the theme'],
    ['Enter / Space (cycle button)', 'Switches to the next mode'],
  ],
  tokens: ['card', 'border', 'secondary', 'foreground', 'muted-foreground', 'focus-ring'],
};
