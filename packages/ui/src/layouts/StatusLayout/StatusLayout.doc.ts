import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'StatusLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Full-page status for 404, 403, 500 and maintenance: a centred message (`code`, `title` as the page h1, `description`) with an illustration or icon halo, a primary and a secondary action, and minimal chrome (optional header with the Logo and a footer line). `tone` colours the code and halo with the severity tokens; brand green is only for positive states. Fills its container; `fullScreen` switches to `h-dvh`.',
  pattern: 'landmarks (header, main, footer) + skip link',
  keyboard: [
    ['Tab', 'Skip link, header links, then the primary action first and the secondary action next, then the footer'],
  ],
  tokens: ['background', 'foreground', 'secondary', 'border', 'muted-foreground', 'primary-text', 'warning-text', 'destructive-text', 'focus-ring'],
};
