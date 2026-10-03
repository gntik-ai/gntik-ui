import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Chart card',
  family: 'data-display',
  status: 'beta',
  description: 'A Card with title, optional headline and delta, a 7d/30d/90d range toggle and an area, line or bar chart with an interactive legend.',
  uses: ['Card', 'ToggleGroup', 'AreaChart', 'LineChart', 'BarChart', 'ChartLegend'],
};
