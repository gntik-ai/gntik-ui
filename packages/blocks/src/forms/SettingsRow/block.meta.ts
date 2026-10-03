import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Settings row',
  family: 'forms',
  status: 'stable',
  description: 'A setting with its label and description on the left and a control (Switch by default) on the right.',
  uses: ['Switch'],
};
