import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Form section',
  family: 'forms',
  status: 'stable',
  description: 'Two-column settings section: title and help on the left, fields on the right; stacks on small screens.',
  uses: ['Field', 'Input', 'Textarea'],
};
