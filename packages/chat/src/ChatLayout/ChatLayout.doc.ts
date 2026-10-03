import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ChatLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Full-height chat frame: scrollable thread with auto-scroll that respects scrolling up, a jump-to-latest button, a composer pinned below and an optional resizable side panel (artifact or details).',
  pattern: 'window splitter',
  keyboard: [
    ['Tab', 'Moves through the thread, the composer, the resize handle and the panel'],
    ['ArrowLeft', 'On the resize handle: widens the side panel (Shift for bigger steps)'],
    ['ArrowRight', 'On the resize handle: narrows the side panel'],
    ['Home', 'On the resize handle: panel to its maximum width'],
    ['End', 'On the resize handle: panel to its minimum width'],
  ],
  tokens: ['background', 'foreground', 'card', 'border', 'primary', 'focus-ring'],
};
