import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ChatComposer',
  group: 'Forms',
  status: 'beta',
  description:
    'Chat input: autosizing textarea, Enter sends and Shift+Enter adds a line, removable attachment chips, a model-picker slot, a character counter near the limit, a disabled state, and a Stop button while a reply streams.',
  keyboard: [
    ['Enter', 'Sends the message (ignored while streaming or during IME composition)'],
    ['Shift+Enter', 'Inserts a new line'],
    ['Escape', 'While a reply streams: stops it'],
    ['Tab', 'Moves from the text box to attachment remove buttons, tools, the model picker and Send/Stop'],
  ],
  tokens: ['card', 'border', 'primary', 'ring', 'secondary', 'muted-foreground', 'destructive-text', 'focus-ring'],
};
