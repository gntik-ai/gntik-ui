import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ReasoningBlock',
  group: 'Display',
  status: 'beta',
  description:
    'A collapsible reasoning trace above an assistant answer. Opens while streaming, then settles once to defaultOpen unless the reader toggles it. Controlled open always wins. Strings use safe streaming Markdown; other nodes render as provided. Pass durationMs for whole-second elapsed labels, or label to override. Empty completed traces render nothing. Use ChatAnnouncer reasoning for the thinking phase; the trace itself has no live region.',
  primitive: '@base-ui/react/collapsible',
  pattern: 'disclosure',
  keyboard: [
    ['Enter', 'Expands or collapses the reasoning trace'],
    ['Space', 'Expands or collapses the reasoning trace'],
    ['Tab', 'Moves to links and controls in the open panel'],
  ],
  tokens: ['card', 'border', 'secondary', 'muted-foreground', 'focus-ring'],
};
