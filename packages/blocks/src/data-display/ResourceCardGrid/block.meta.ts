import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Resource card grid',
  family: 'data-display',
  status: 'beta',
  description: 'Responsive grid of resource cards with icon or avatar, name, status, meta figures and a row-actions menu.',
  uses: ['Avatar', 'StatusTag', 'MoreMenu'],
};
