import { ScheduleInput } from '../ScheduleInput';

const now = new Date(Date.UTC(2026, 5, 15, 7, 30));

export default function ScheduleInputCustom() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <ScheduleInput aria-label="Backup schedule" defaultValue="*/15 9-17 * * 1-5" timeZone="UTC" locale="en-US" now={now} previewCount={3} />
      <ScheduleInput aria-label="Cleanup schedule" defaultValue="0 3 31 2 *" timeZone="UTC" locale="en-US" now={now} frequencies={['daily', 'weekly', 'custom']} />
    </div>
  );
}
