import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Page',
  group: 'Layout',
  status: 'beta',
  description:
    'The page inside any shell: a header (a custom slot such as the blocks PageHeader, or a simple h1 + description + actions), the body, and an optional sticky action bar (a labelled region) pinned to the bottom of the scroll container. Widths: narrow 640 · default 1120 · wide 1440 · full. It renders no <main>; the shell owns it.',
  pattern: 'document structure (h1 + region for the action bar)',
  keyboard: [['Tab', 'Follows the reading order: header actions, body, then the sticky action bar']],
  tokens: ['card', 'border', 'foreground', 'muted-foreground'],
};
