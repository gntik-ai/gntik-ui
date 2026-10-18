import { useState } from 'react';
import { TimePicker } from '../TimePicker';

export default function TimePickerClearable() {
  const [cleared, setCleared] = useState(false);
  return (
    <div className="grid max-w-sm gap-4">
      <TimePicker
        clearable
        clearLabel="Reset start time"
        aria-label="Start time"
        defaultValue="09:30"
        hourCycle={24}
        onClear={() => setCleared(true)}
      />
      <p className="text-sm text-muted-foreground">
        {cleared ? 'Time cleared.' : 'Clear every segment and return to hours.'}
      </p>
    </div>
  );
}
