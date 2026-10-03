import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Carousel',
  group: 'Display',
  status: 'beta',
  description:
    'Scroll-snap media strip: one, two, three or auto-width slides per view, previous/next buttons, optional picker dots, arrow keys on the focused strip. No autoplay by default; `autoplay` adds a pause control, pauses on hover and focus, and starts paused under reduced motion.',
  pattern: 'APG carousel (region with aria-roledescription="carousel", slides as labelled groups)',
  keyboard: [
    ['Tab', 'Moves through the controls, then the strip, then the slide content'],
    ['ArrowRight / ArrowLeft', 'On the focused strip: next / previous slide (mirrored in RTL)'],
    ['Home / End', 'On the focused strip: first / last slide'],
    ['Enter / Space', 'Activates previous, next, a picker dot or the pause control'],
  ],
  tokens: ['card', 'border', 'foreground', 'muted-foreground', 'primary', 'secondary', 'focus-ring'],
};
