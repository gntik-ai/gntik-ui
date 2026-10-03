import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'AuthLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Sign-in, sign-up and reset shell in three variants: `split` (brand panel on the chrome surface + form; the panel hides below `lg` and the logo moves above the form), `card` (form centred in a card) and `full-bleed` (form straight on the chrome surface). The logo defaults to the ThemeProvider brand preset (Logo with wordmark). The form is first in the DOM, so it is first in tab order on every screen size. Fills its container; `fullScreen` switches to `h-dvh`.',
  pattern: 'landmarks (main, labelled brand aside) + skip link',
  keyboard: [
    ['Tab', 'Skip link first, then the form fields in order, then the footer links'],
    ['Enter on the skip link', 'Moves focus to the form region'],
  ],
  tokens: ['background', 'chrome', 'card', 'card-foreground', 'border', 'muted-foreground', 'primary-text', 'focus-ring'],
};
