import { useState } from 'react';
import { AreaChart } from '../AreaChart';
import type { ChartRange } from '../ChartBrush';
import { chartFmt } from '../format';
import { LATENCY_DAYS } from './data';

/** Requests over four weeks with a range brush (controlled): drag or use the arrow keys on the handles. */
export default function BrushZoom() {
  const [range, setRange] = useState<ChartRange>([14, 27]);
  return (
    <AreaChart
      aria-label="Daily requests"
      data={LATENCY_DAYS}
      index="day"
      categories={['requests']}
      valueFormatter={chartFmt.compact}
      showLegend={false}
      brush
      range={range}
      onRangeChange={setRange}
    />
  );
}
