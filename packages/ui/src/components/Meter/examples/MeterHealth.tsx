import { Meter } from '../Meter';

/** Scores and budgets where low is bad: `higherIsBetter` inverts the thresholds. */
export default function MeterHealth() {
  return (
    <div className="grid max-w-md gap-5">
      <Meter label="Uptime score" value={92} higherIsBetter valueLabel="92 / 100" aria-valuetext="92 of 100" />
      <Meter label="Test coverage" value={46} higherIsBetter valueLabel="46%" note="Target is 70%" thresholds={{ warning: 70, destructive: 30 }} />
      <Meter label="Error budget left" value={12} higherIsBetter valueLabel="12% left" aria-valuetext="12 percent left" note="Freeze risky deploys" />
    </div>
  );
}
