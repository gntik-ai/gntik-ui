import { Sparkline } from '../Sparkline';

const STATS = [
  { label: 'Requests', value: '48.2k', delta: '+12%', good: true, data: [31, 34, 33, 38, 36, 41, 40, 44, 43, 46, 45, 48], area: true, tone: 'primary' },
  { label: 'p95 latency', value: '182 ms', delta: '−8%', good: true, data: [214, 220, 205, 210, 198, 201, 195, 190, 192, 186, 184, 182], area: false, tone: 'primary' },
  { label: 'Error rate', value: '1.4%', delta: '+0.6 pt', good: false, data: [0.6, 0.7, 0.6, 0.8, 0.9, 0.8, 1.1, 1.0, 1.2, 1.3, 1.2, 1.4], area: false, tone: 'destructive' },
] as const;

export default function SparklineStats() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
      {STATS.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] text-muted-foreground">{stat.label}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-semibold tracking-tight text-foreground">{stat.value}</span>
            <span className={stat.good ? 'text-[12px] font-medium text-success-text' : 'text-[12px] font-medium text-destructive-text'}>{stat.delta}</span>
          </p>
          <Sparkline className="mt-3" width={180} height={40} data={stat.data} area={stat.area} tone={stat.tone} label={stat.label} markers={['last']} />
        </div>
      ))}
    </div>
  );
}
