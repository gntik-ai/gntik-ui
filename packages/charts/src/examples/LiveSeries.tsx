import { useEffect } from 'react';
import { LineChart } from '../LineChart';
import { chartFmt } from '../format';
import { useLiveSeries } from '../live';

interface Sample {
  t: string;
  rps: number;
}

const sample = (i: number): Sample => ({ t: `${String(Math.floor(i / 60) % 60).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`, rps: 420 + Math.round(80 * Math.sin(i / 4) + ((i * 37) % 23)) });

/**
 * Requests per second, one point a second over a 30-point window. Updates freeze while the
 * pointer or focus is on the chart, a Pause button stops them, and nothing animates under
 * prefers-reduced-motion.
 */
export default function LiveSeries({ interval = 1000 }: { interval?: number }) {
  const live = useLiveSeries<Sample>({ initial: Array.from({ length: 30 }, (_, i) => sample(i)), windowSize: 30 });
  const { append } = live;
  useEffect(() => {
    let i = 30;
    const id = window.setInterval(() => append(sample(i++)), interval);
    return () => window.clearInterval(id);
  }, [append, interval]);
  return (
    <div {...live.pauseProps}>
      <div className="mb-2 flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
        <span>
          <span aria-live="polite">{live.paused ? 'Paused' : 'Live'}</span>
          {live.paused && live.pending > 0 && <span className="font-mono tabular-nums"> · {live.pending} new</span>}
        </span>
        <button
          type="button"
          aria-pressed={live.manuallyPaused}
          onClick={live.togglePaused}
          className="h-7 rounded-md border border-border bg-card px-2.5 font-medium text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          {live.manuallyPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <LineChart
        aria-label="Requests per second, live"
        data={live.data}
        index="t"
        categories={['rps']}
        valueFormatter={chartFmt.num}
        showLegend={false}
        startEndOnly
        animate={!live.reducedMotion}
        thresholds={[{ value: 500, label: 'Capacity', tone: 'warning' }]}
      />
    </div>
  );
}
