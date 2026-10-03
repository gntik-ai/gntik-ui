import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'AttachmentList',
  group: 'Display',
  status: 'beta',
  description:
    'Files attached to a message or waiting in the composer. Each AttachmentChip shows an image thumbnail or a file-type icon, the name, the size, upload progress (a labelled progressbar; indeterminate holds still under reduced motion), an error with Retry, and a Remove button. `variant="tile"` gives larger image previews inside a message. `validateFiles` / `matchesAccept` back the composer’s accept and max-size checks.',
  pattern: 'list',
  keyboard: [
    ['Tab', 'Moves through each chip’s Retry (on error) and Remove buttons'],
    ['Enter / Space', 'Activates the focused Retry or Remove button'],
  ],
  tokens: ['secondary', 'card', 'border', 'muted-foreground', 'primary', 'destructive', 'destructive-text', 'focus-ring'],
};
