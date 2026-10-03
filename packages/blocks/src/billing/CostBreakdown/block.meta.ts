import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Cost breakdown',
  family: 'billing',
  status: 'beta',
  description: 'Cost composition: a donut with the total in the hole and the categories ranked by amount with share bars, in categorical (non-severity) colours.',
  uses: ['Card', 'DonutChart'],
};
