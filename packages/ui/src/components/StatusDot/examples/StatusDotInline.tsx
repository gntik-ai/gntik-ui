import { StatusDot } from '../StatusDot';

const SERVICES = [
  { name: 'api-gateway', tone: 'success', state: 'Healthy' },
  { name: 'billing-worker', tone: 'warning', state: 'Slow responses' },
  { name: 'search-index', tone: 'destructive', state: 'Down' },
] as const;

export default function StatusDotInline() {
  return (
    <ul className="w-72 divide-y divide-border rounded-md border border-border bg-card">
      {SERVICES.map((svc) => (
        <li key={svc.name} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground">
          <StatusDot tone={svc.tone} size="sm" aria-label={svc.state} pulse={svc.tone === 'destructive'} />
          <span className="font-mono text-[12px]">{svc.name}</span>
          <span className="ms-auto text-[12px] text-muted-foreground">{svc.state}</span>
        </li>
      ))}
    </ul>
  );
}
