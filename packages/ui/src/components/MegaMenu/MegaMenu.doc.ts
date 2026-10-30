import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'MegaMenu',
  group: 'Navigation',
  status: 'beta',
  description:
    'Top navigation with wide panels: items with sections open a panel of link columns with descriptions and optional featured content; plain items are links. Hover or click opens, the panel resizes between items, router links come from LinkProvider and the current page is marked. Use it as the StackedLayout sub-nav row; `megaMenuNavItems` feeds MobileNav. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. See the TransferList catalog defaults example for a live Spanish preview of this component.',
  primitive: '@base-ui/react/navigation-menu',
  pattern: 'disclosure navigation (nav landmark, triggers with aria-expanded)',
  keyboard: [
    ['Tab', 'Moves between top-level items, then into an open panel'],
    ['Enter / Space / ArrowDown', 'Opens the panel of the focused trigger'],
    ['ArrowRight / ArrowLeft', 'Moves between top-level items'],
    ['Escape', 'Closes the panel and returns focus to its trigger'],
  ],
  dataAttributes: [
    ['data-popup-open', 'trigger', 'The associated popup is open.'],
    ['data-current', 'trigger', 'The item represents the current location.'],
    ['data-popup-open', 'chevron', 'The associated popup is open.'],
    ['data-instant', 'positioner', 'The state changes without a transition.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-starting-style', 'content', 'The part is entering.'],
    ['data-ending-style', 'content', 'The part is leaving.'],
    ['data-active', 'link', 'The part is active.'],
  ],
  tokens: [
    'popover',
    'popover-foreground',
    'border',
    'accent',
    'accent-foreground',
    'secondary',
    'primary',
    'muted-foreground',
    'focus-ring',
  ],
};
