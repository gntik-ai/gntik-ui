import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Stat card',
  family: 'data-display',
  status: 'beta',
  description: 'One rich stat: icon tile, value and delta that recalculate per range (7d/30d/90d), a trend chart and a footer action.',
  uses: ['Card', 'ToggleGroup', 'Sparkline', 'Button'],
};
