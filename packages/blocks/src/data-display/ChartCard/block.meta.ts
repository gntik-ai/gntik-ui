import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Chart card',
  family: 'data-display',
  status: 'beta',
  description:
    'A Card with title, optional headline and delta, an area, line, bar or heatmap chart with legend and loading, empty and error states, default 7d/30d/90d or ordered custom ranges via ranges, controlled range/onRangeChange, and showRangeToggle={false} when a page toolbar owns the range (pass the page window as range so the toolbar is the only range control). Uncontrolled selection starts at defaultRange or the first option; unknown range/defaultRange keys fall back to the first option for selection, data and label, with a development-only warning. Supply matching dataByRange keys and range labels; see examples/custom-ranges.tsx and examples/toolbar-owned-range.tsx.',
  uses: ['Card', 'ToggleGroup', 'AreaChart', 'LineChart', 'BarChart', 'Heatmap', 'ChartLegend'],
};
