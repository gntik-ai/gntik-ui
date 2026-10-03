import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '../Card';

const ROWS = [
  ['Plan', 'Team'],
  ['Seats', '12 of 20'],
  ['Renews', 'Nov 1, 2026'],
] as const;

export default function CardVariants() {
  return (
    <div className="grid max-w-[420px] gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Current plan and usage.</CardDescription>
        </CardHeader>
        <dl className="divide-y divide-border border-t border-border">
          {ROWS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-5 py-3">
              <dt className="text-[13px] text-muted-foreground">{k}</dt>
              <dd className="font-mono text-[12.5px] text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card variant="well">
        <CardBody>This region does not accept new deployments until the quota is reviewed.</CardBody>
      </Card>
    </div>
  );
}
