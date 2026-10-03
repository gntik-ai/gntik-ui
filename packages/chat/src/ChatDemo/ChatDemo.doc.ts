import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ChatDemo',
  group: 'Layout',
  status: 'experimental',
  description:
    'Reference composition of the chat pack: suggestions in the empty state, a tool call, a streamed markdown reply with sources, Stop, Retry and feedback, and a resizable details panel. Streaming is mocked with timers that are cleaned up.',
  keyboard: [
    ['Enter', 'In the composer: sends; on a suggestion: sends it'],
    ['Escape', 'In the composer while streaming: stops the reply'],
  ],
  tokens: ['background', 'card', 'border', 'primary', 'focus-ring'],
};
