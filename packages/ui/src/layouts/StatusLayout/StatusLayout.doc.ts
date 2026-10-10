import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'StatusLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Full-page status for 404, 403, 500 and maintenance: a centred message with a `heading` slot replacing `title` for exactly one page h1; `titleRef` on the built-in h1 enables focus() with tabIndex=-1 outside the Tab order. With no heading, `title` remains required and renders as today. Supply either title or a non-empty heading, never both; the slot must contain exactly one h1. The slot is full width within the centred column and uses the foreground token. For a PageHeader slot, set as="div", breadcrumbs={null}, meta={[]}, tabs={null}, actions={[]}, status="" and description={null} to disable demo fixtures; keep the description on StatusLayout so it appears once. Pass titleRef to PageHeader (or a ref and tabIndex=-1 to a generic h1) and call ref.current.focus() on route load when needed. Keep slot links and actions empty so the primary action stays first in main’s Tab order. Code stays above the heading, with description, illustration or icon halo, primary and secondary actions, optional Logo header and footer unchanged. `tone` colours the code and halo with severity tokens; brand green is only for positive states. Fills its container; `fullScreen` switches to `h-dvh`.',
  pattern: 'landmarks (header, main, footer) + skip link',
  keyboard: [
    ['Tab', 'Skip link, header links, then the primary action first and the secondary action next, then the footer'],
    ['Programmatic focus', 'titleRef.current.focus() focuses the built-in h1; for a heading slot, use the heading node’s own ref (PageHeader titleRef). Neither h1 is a Tab stop'],
  ],
  tokens: ['background', 'foreground', 'secondary', 'border', 'muted-foreground', 'primary-text', 'warning-text', 'destructive-text', 'focus-ring'],
};
