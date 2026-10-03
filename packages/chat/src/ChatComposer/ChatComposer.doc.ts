import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ChatComposer',
  group: 'Forms',
  status: 'beta',
  description:
    'Chat input: autosizing textarea, Enter sends and Shift+Enter adds a line, attachments (pick, paste or drag-and-drop files; `accept`, `maxSize` and `maxFiles` validation with messages in an alert; chips with image thumbnails, file-type icons, size, upload progress, error + Retry and Remove), a model-picker slot (e.g. a compact ModelPicker), a character counter near the limit, a disabled state, and a Stop button while a reply streams.',
  keyboard: [
    ['Enter', 'Sends the message (ignored while streaming or during IME composition)'],
    ['Shift+Enter', 'Inserts a new line'],
    ['Escape', 'While a reply streams: stops it'],
    ['Tab', 'Moves through attachment Retry/Remove buttons, the text box, attach, tools, the model picker and Send/Stop'],
    ['Ctrl/⌘+V', 'In the text box: pasted files are attached (validated) instead of inserted'],
  ],
  tokens: ['card', 'destructive-chip-text', 'primary-text', 'border', 'primary', 'ring', 'secondary', 'muted-foreground', 'destructive-text', 'focus-ring'],
};
