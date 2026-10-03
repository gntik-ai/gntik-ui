import { Meter } from '../Meter';

const USAGE = [
  { label: 'API requests', used: 6200, total: 10000, unit: 'requests' },
  { label: 'Storage', used: 43, total: 50, unit: 'GB' },
  { label: 'Build minutes', used: 3240, total: 3000, unit: 'min', note: 'Over by 240 min, billed at $0.008 / min' },
];

const fmt = (n: number) => n.toLocaleString('en-US');

export default function MeterUsage() {
  return (
    <div className="grid max-w-md gap-5">
      {USAGE.map((m) => (
        <Meter
          key={m.label}
          label={m.label}
          value={m.used}
          max={m.total}
          valueLabel={`${fmt(m.used)} / ${fmt(m.total)} ${m.unit}`}
          aria-valuetext={`${fmt(m.used)} of ${fmt(m.total)} ${m.unit}`}
          note={m.note}
        />
      ))}
      <Meter label="Seats" value={18} max={20} thresholds={{ warning: 90 }} size="sm" />
    </div>
  );
}
