import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Thumbnail',
  group: 'Display',
  status: 'beta',
  description:
    'File or image preview tile: image or file-type icon with extension tag, name and size caption, upload progress (progressbar + shimmer that holds still under reduced motion), error state with retry, and a remove button. ThumbnailList lays tiles out as a wrapping list. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. See the TransferList catalog defaults example for a live Spanish preview of this component.',
  pattern: 'figure',
  keyboard: [
    ['Tab', 'Moves to the remove button (and retry, in the error state) of each tile'],
    ['Enter / Space', 'Activates remove or retry'],
  ],
  tokens: [
    'card',
    'border',
    'secondary',
    'muted-foreground',
    'foreground',
    'primary',
    'destructive',
    'destructive-text',
    'focus-ring',
  ],
};
