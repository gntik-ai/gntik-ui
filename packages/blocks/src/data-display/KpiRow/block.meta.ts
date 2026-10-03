import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'KPI row',
  family: 'data-display',
  status: 'beta',
  description: 'Three to five stat tiles: label, value, a delta whose arrow and colour are independent, and an optional sparkline. Cards or a divided strip.',
  uses: ['Sparkline'],
};
