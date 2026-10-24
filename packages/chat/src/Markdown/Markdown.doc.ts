import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'Markdown',
  group: 'Display',
  status: 'beta',
  description:
    'Safe, token-styled markdown for model output (react-markdown + remark-gfm): headings, lists, task lists, tables, blockquotes, inline and fenced code with a copy button, links with an external marker. Raw HTML is never rendered, unsafe URL schemes are stripped, and partial streamed input (unclosed fences) renders cleanly. Copy actions show common.copyFailed when clipboard access is denied or unavailable, with no success icon; successful copies keep their labels and reset after 1600ms. See the bilingual Result feedback live preview.',
  keyboard: [
    ['Tab', 'Moves through links and code-block copy buttons in reading order'],
    ['Enter', 'Follows a link or copies the focused code block'],
  ],
  tokens: ['foreground', 'muted-foreground', 'primary-text', 'secondary', 'border', 'focus-ring'],
};
