import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'VisuallyHidden',
  group: 'Layout',
  status: 'stable',
  description:
    'Screen-reader-only content (sr-only), with a `focusable` variant that appears while focused. SkipLink is the canonical use: the first Tab stop on a page, revealed on focus, that moves focus to the main content.',
  primitive: '@base-ui/react/use-render',
  pattern: 'skip link',
  keyboard: [
    ['Tab', 'Focuses the SkipLink and reveals it (first Tab stop on the page)'],
    ['Enter', 'Moves focus to the target (e.g. <main>), not just the scroll position'],
  ],
  tokens: ['card', 'border', 'foreground', 'shadow-md', 'focus-ring'],
};
