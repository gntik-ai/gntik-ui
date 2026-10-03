import { LineChart } from '../LineChart';
import { chartFmt } from '../format';
import { LATENCY_DAYS } from './data';

/** p95 latency against an SLO and an alert line, with deploy and incident markers. */
export default function ThresholdsAndAnnotations() {
  return (
    <LineChart
      aria-label="p95 latency, September"
      data={LATENCY_DAYS}
      index="day"
      categories={['p95']}
      valueFormatter={chartFmt.ms}
      showLegend={false}
      thresholds={[
        { value: 300, label: 'SLO 300 ms', tone: 'warning' },
        { value: 400, label: 'Alert 400 ms', tone: 'destructive' },
      ]}
      annotations={[
        { x: 'Sep 6', label: 'Deploy v2.4', description: 'Rolled out to every region in 12 minutes.', tone: 'primary' },
        { x: 'Sep 18', label: 'Incident', description: 'Cache cluster failover; latency recovered after 40 minutes.', tone: 'destructive' },
      ]}
    />
  );
}
