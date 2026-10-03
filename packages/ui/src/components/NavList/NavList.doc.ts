import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'NavList',
  group: 'Navigation',
  status: 'beta',
  description:
    'Vertical navigation for sidebars and settings pages: labelled (optionally foldable) groups of items with icon, label and badge, nested collapsible sub-items, and aria-current="page" on the active item with the brand accent bar. `collapsed` turns it into an icon rail with tooltips (nested sections open as flyout menus). Links render through LinkProvider, so client routers work.',
  primitive: '@base-ui/react/collapsible',
  pattern: 'navigation landmark with disclosure sections',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves through items, group toggles and section toggles in order'],
    ['Enter', 'Follows the focused link (or runs the item button)'],
    ['Enter / Space', 'On a group heading or nested section: expands or collapses it'],
    ['Enter / Space (rail)', 'Opens a nested section as a flyout menu (arrow keys move, Escape closes)'],
  ],
  tokens: ['chrome', 'accent', 'accent-foreground', 'primary', 'primary-text', 'secondary', 'border', 'muted-foreground', 'foreground', 'focus-ring'],
};
