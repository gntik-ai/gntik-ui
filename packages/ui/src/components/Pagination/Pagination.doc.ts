import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Pagination',
  group: 'Navigation',
  status: 'stable',
  description:
    'Moves through pages of results. Pagination is numbered (first, last, siblings of the current page and ellipses, constant width) and page-size agnostic: page, pageCount, onPageChange. PaginationCompact is the table-footer form: "1–10 of 97" with previous/next.',
  pattern: 'navigation landmark with aria-current',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves through every enabled control (previous, each page, next)'],
    ['Enter / Space', 'Activates the focused control and changes page'],
  ],
  tokens: ['primary', 'primary-foreground', 'card', 'border', 'ring', 'secondary', 'muted-foreground', 'foreground', 'focus-ring'],
};
