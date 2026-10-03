import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Comment thread',
  family: 'data-display',
  status: 'beta',
  description: 'Plain-text comments with avatar, author and Timestamp, plus a reply composer (Textarea + Button, ⌘/Ctrl+Enter posts).',
  uses: ['Avatar', 'Timestamp', 'Textarea', 'Button'],
};
