import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'MegaMenu',
  group: 'Navigation',
  status: 'beta',
  description:
    'Top navigation with wide panels: items with sections open a panel of link columns with descriptions and optional featured content; plain items are links. Hover or click opens, the panel resizes between items, router links come from LinkProvider and the current page is marked. Use it as the StackedLayout sub-nav row; `megaMenuNavItems` feeds MobileNav.',
  primitive: '@base-ui/react/navigation-menu',
  pattern: 'disclosure navigation (nav landmark, triggers with aria-expanded)',
  keyboard: [
    ['Tab', 'Moves between top-level items, then into an open panel'],
    ['Enter / Space / ArrowDown', 'Opens the panel of the focused trigger'],
    ['ArrowRight / ArrowLeft', 'Moves between top-level items'],
    ['Escape', 'Closes the panel and returns focus to its trigger'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'accent', 'accent-foreground', 'secondary', 'primary', 'muted-foreground', 'focus-ring'],
};
