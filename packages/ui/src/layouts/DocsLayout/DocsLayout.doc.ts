import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DocsLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Documentation shell: top bar · left nav (a NavList) · article · right table of contents. The `Outline` sub-component is the table of contents: scroll-spy with IntersectionObserver (rooted in the article column, guarded where it is missing) marks the heading in view with aria-current="location", and activating a link moves focus to the heading. Below `lg` the nav hides and the table of contents moves into a Collapsible above the article. Fills its container; `fullScreen` switches to `h-dvh`.',
  primitive: '@base-ui/react/collapsible (small-screen table of contents)',
  pattern: 'landmarks (header, nav, main, "On this page" nav) + disclosure',
  keyboard: [
    ['Tab', 'Skip link, top bar, left nav, the article, then the table of contents links'],
    ['Enter on a table of contents link', 'Scrolls to the heading and moves focus to it'],
    ['Enter / Space on "On this page"', 'Small screens: expands or collapses the table of contents'],
  ],
  tokens: ['background', 'foreground', 'chrome', 'card', 'border', 'primary', 'primary-text', 'muted-foreground', 'focus-ring'],
};
