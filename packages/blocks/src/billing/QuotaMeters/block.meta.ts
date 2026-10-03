import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Quota meters',
  family: 'billing',
  status: 'beta',
  description: 'Plan quotas as usage meters with used/limit labels, amber/red thresholds, overage notes and a current/projected toggle.',
  uses: ['Meter', 'ToggleGroup', 'Toggle'],
};
