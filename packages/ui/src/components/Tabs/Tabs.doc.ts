import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Tabs',
  group: 'Navigation',
  status: 'stable',
  description:
    'Switches between views of the same block without leaving the page. Two variants (underline, pills), optional icons and count badges, a sliding indicator and a full-width layout. Compound parts: Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel.',
  primitive: '@base-ui/react/tabs',
  pattern: 'tabs',
  keyboard: [
    ['ArrowRight / ArrowLeft', 'Moves focus to the next / previous tab (wraps around)'],
    ['Home / End', 'Moves focus to the first / last tab'],
    ['Enter / Space', 'Activates the focused tab and shows its panel'],
    ['Tab', 'Moves focus from the active tab into its panel'],
  ],
  tokens: ['primary', 'primary-text', 'border', 'secondary', 'card', 'muted-foreground', 'foreground', 'focus-ring'],
};
