import { InfoTip } from '../InfoTip';

export default function InfoTipLabel() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor="retention" className="text-[13px] font-medium text-foreground">
          Log retention
        </label>
        <InfoTip label="log retention" title="Log retention">
          Logs older than this are deleted every night. Longer retention counts towards your storage quota.
        </InfoTip>
      </div>
      <select id="retention" defaultValue="30" className="h-9 w-48 rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
        <option value="7">7 days</option>
        <option value="30">30 days</option>
        <option value="90">90 days</option>
      </select>
    </div>
  );
}
