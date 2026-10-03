import { StatusDot } from '../StatusDot';

export default function StatusDotTones() {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <li><StatusDot tone="success" label="Operational" /></li>
      <li><StatusDot tone="primary" label="Deploying" pulse /></li>
      <li><StatusDot tone="warning" label="Degraded" /></li>
      <li><StatusDot tone="destructive" label="Outage" pulse /></li>
      <li><StatusDot tone="info" label="Scheduled" /></li>
      <li><StatusDot tone="neutral" label="Paused" /></li>
    </ul>
  );
}
