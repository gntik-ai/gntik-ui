import { InfoTip } from '../InfoTip';

export default function InfoTipStat() {
  return (
    <div className="w-56 rounded-lg border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        Monthly spend
        <InfoTip label="monthly spend" openOnHover side="right">
          Total of paid and pending invoices since the 1st of the month, before taxes.
        </InfoTip>
      </p>
      <p className="mt-1 text-[22px] font-semibold tracking-tight text-foreground">$1,284</p>
    </div>
  );
}
