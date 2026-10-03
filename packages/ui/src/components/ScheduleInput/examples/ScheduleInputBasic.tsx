import { useState } from 'react';
import { ScheduleInput } from '../ScheduleInput';

const now = new Date(Date.UTC(2026, 5, 15, 7, 30));

export default function ScheduleInputBasic() {
  const [cron, setCron] = useState('0 9 * * 1-5');
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <ScheduleInput aria-label="Report schedule" value={cron} onValueChange={setCron} timeZone="Europe/Madrid" locale="en-US" now={now} name="schedule" />
    </div>
  );
}
