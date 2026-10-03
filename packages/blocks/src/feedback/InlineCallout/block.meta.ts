import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Inline callout',
  family: 'feedback',
  status: 'beta',
  description: 'Alert-based in-content callout with a tone, title, body, action buttons or links and optional dismiss.',
  uses: ['Alert', 'Button', 'Link'],
};
