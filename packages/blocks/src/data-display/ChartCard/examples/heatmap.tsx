import { ChartCard } from '../ChartCard';
import { TRAFFIC_BUCKETS, TRAFFIC_BY_RANGE, TRAFFIC_RANGES, type TrafficRow } from '../fixtures';

/** A ChartCard with a heatmap: weekday × time-of-day traffic, colour scale as the legend. */
export default function HeatmapChartCard() {
  return (
    <ChartCard<TrafficRow>
      kind="heatmap"
      title="Traffic by hour"
      description="Requests per weekday, in thousands"
      ranges={TRAFFIC_RANGES}
      dataByRange={TRAFFIC_BY_RANGE}
      index="day"
      categories={TRAFFIC_BUCKETS}
      valueFormatter={(v) => `${v}k`}
      heatmap={{ rowHeader: 'Day', showValues: false }}
      height={240}
    />
  );
}
