import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'ScrollArea',
  group: 'Layout',
  status: 'stable',
  description:
    'Native scroll container with thin token-styled scrollbars that fade in on hover and while scrolling. Vertical, horizontal or both; optional bordered surface. With an aria-label the viewport is a named region, and it joins the Tab order whenever it overflows.',
  primitive: '@base-ui/react/scroll-area',
  pattern: 'region',
  keyboard: [
    ['Tab', 'Focuses the scrollable viewport (only when its content overflows)'],
    ['ArrowUp / ArrowDown / PageUp / PageDown / Home / End', 'Scrolls the focused viewport natively'],
  ],
  dataAttributes: [
    ['data-hovering', 'scrollbar', 'The pointer is over the part.'],
    ['data-scrolling', 'scrollbar', 'The area is being scrolled.'],
    ['data-orientation', 'scrollbar', 'The attribute value specifies the horizontal or vertical orientation.'],
  ],
  tokens: ['border', 'muted-foreground', 'card', 'focus-ring'],
};
