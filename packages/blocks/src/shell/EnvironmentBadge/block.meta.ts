import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Environment badge',
  family: 'shell',
  status: 'beta',
  description: 'Environment + region chip ("production · eu-west") for the topbar or a page header; tone follows the environment.',
  uses: ['Badge'],
};
