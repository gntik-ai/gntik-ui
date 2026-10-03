import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Validation summary',
  family: 'forms',
  status: 'stable',
  description: 'Error summary that lists every problem with a link to its field and takes focus after a failed submit.',
  uses: ['Alert', 'Link'],
};
