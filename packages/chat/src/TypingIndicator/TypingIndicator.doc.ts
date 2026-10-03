import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'TypingIndicator',
  group: 'Feedback',
  status: 'beta',
  description:
    'Three pulsing dots shown while a reply is being written, with the text "Assistant is typing" for screen readers (or visible with `showLabel`). The dots are decorative and hold still under reduced motion. ChatMessage renders it while a streaming turn is still empty.',
  keyboard: [],
  tokens: ['muted-foreground'],
};
