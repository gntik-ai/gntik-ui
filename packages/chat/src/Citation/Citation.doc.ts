import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'Citation',
  group: 'Display',
  status: 'beta',
  description:
    'Numbered source references for grounded answers: an inline [n] marker that previews the source (title, host, snippet, link) on hover, focus + Enter or click, and CitationList, the numbered list of sources under a reply. Only http(s) URLs become links.',
  primitive: '@base-ui/react/popover',
  pattern: 'dialog (non-modal)',
  keyboard: [
    ['Enter', 'On a marker: opens the source preview'],
    ['Space', 'On a marker: opens the source preview'],
    ['Escape', 'Closes the preview and returns focus to the marker'],
    ['Tab', 'Moves to the "Open source" link inside an open preview'],
  ],
  tokens: ['primary', 'primary-text', 'popover', 'secondary', 'card', 'border', 'muted-foreground', 'focus-ring'],
};
