import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Toolbar',
  group: 'Actions',
  status: 'stable',
  description:
    'Action bar above tables and lists: search, filters and actions with a single Tab stop and arrow-key navigation. Start / center / end lanes, groups, separators, links and inputs; buttons use the kit Button styles. Variants: bar, floating, plain.',
  primitive: '@base-ui/react/toolbar',
  pattern: 'toolbar',
  keyboard: [
    ['ArrowRight / ArrowLeft', 'Moves focus to the next / previous item (roving tabindex, wraps around)'],
    ['Tab / Shift+Tab', 'Moves focus out of the toolbar (one Tab stop)'],
    ['Enter / Space', 'Activates the focused button'],
  ],
  tokens: ['border', 'secondary', 'card', 'background', 'primary', 'primary-text', 'muted-foreground', 'foreground', 'focus-ring'],
};
