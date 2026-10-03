import { Timer } from '../Timer';

const T0 = Date.now();

const JOBS = [
  { name: 'Build 482', status: 'running', start: T0 - 134_000 },
  { name: 'Data import', status: 'paused', start: T0 - 3_725_000, end: T0 - 600_000 },
  { name: 'Nightly backup', status: 'stopped', start: T0 - 7_200_000, end: T0 - 5_400_000 },
] as const;

export default function TimerStates() {
  return (
    <ul className="grid w-full max-w-sm gap-2">
      {JOBS.map((job) => (
        <li key={job.name} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-3.5 py-2.5">
          <span className="text-[13px] font-medium text-foreground">{job.name}</span>
          <Timer start={job.start} status={job.status} end={'end' in job ? job.end : undefined} format="compact" />
        </li>
      ))}
    </ul>
  );
}
