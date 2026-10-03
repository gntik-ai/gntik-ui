import { Sparkline } from '../Sparkline';

const DEPLOYS = [4, 6, 3, 8, 7, 5, 9, 6, 4, 7, 10, 8, 6, 9];
const BALANCE = [120, 132, 128, 140, 151, 138, 160, 157];

export default function SparklineVariants() {
  return (
    <dl className="grid gap-4 text-[13px]">
      <div className="flex items-center gap-4">
        <dt className="w-36 text-muted-foreground">Deployments / day</dt>
        <dd><Sparkline variant="bar" data={DEPLOYS} width={140} height={28} label="Deployments per day" /></dd>
      </div>
      <div className="flex items-center gap-4">
        <dt className="w-36 text-muted-foreground">Invoice total</dt>
        <dd>
          <Sparkline data={BALANCE} area markers={['min', 'max', 'last']} tone="success" label="Invoice total" formatValue={(v) => `$${v}`} />
        </dd>
      </div>
    </dl>
  );
}
