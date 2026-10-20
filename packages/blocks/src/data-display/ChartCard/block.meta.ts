import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Chart card',
  family: 'data-display',
  status: 'beta',
  description:
    'A Card with chart and legend: default 7d/30d/90d or custom ranges via ranges, controlled range/onRangeChange, and showRangeToggle={false} when a toolbar owns the range (pass its window as range). Supports title, optional headline and delta, area/line/bar/heatmap charts, and loading, empty and error states. Supply matching dataByRange keys and use defaultRange for initial uncontrolled selection; the toolbar is the only range control when the toggle is hidden. Unknown range/defaultRange keys fall back to the first option for selection, data and label, with a development-only warning. Chart states follow the kit I18nProvider locale automatically through ChartLocaleProvider; standalone charts need their own ChartLocaleProvider (en/es, per-key labels overrides). Number/date formatting stays caller-controlled.',
  uses: ['Card', 'ToggleGroup', 'AreaChart', 'LineChart', 'BarChart', 'Heatmap', 'ChartLegend'],
};
