import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Spend vs budget',
  family: 'billing',
  status: 'beta',
  description: 'Cumulative spend line with the end-of-period forecast and a flat budget line, a summary row and a within/over budget status.',
  uses: ['Card', 'Badge', 'LineChart'],
};
