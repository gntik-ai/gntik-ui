import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Breadcrumbs',
  group: 'Navigation',
  status: 'stable',
  description:
    'Location trail in a nav landmark: chevron or slash separators, an optional icon-only root, and the current page marked with aria-current. With `maxItems` the middle collapses into an ellipsis button that expands the full trail in place.',
  pattern: 'breadcrumb',
  keyboard: [
    ['Tab', 'Moves focus through the links and the ellipsis button; the current page is not a link'],
    ['Enter', 'Follows the focused link'],
    ['Enter / Space', 'On the ellipsis button: reveals the hidden levels and focuses the first one'],
  ],
  tokens: ['foreground', 'muted-foreground', 'secondary', 'focus-ring'],
};
