import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Chart card',
  family: 'data-display',
  status: 'beta',
  description: 'A Card with title, optional headline and delta, a 7d/30d/90d range toggle and an area, line, bar or heatmap chart with its legend (the heatmap colour scale), sized to the card and with loading, empty and error states.',
  uses: ['Card', 'ToggleGroup', 'AreaChart', 'LineChart', 'BarChart', 'Heatmap', 'ChartLegend'],
};
