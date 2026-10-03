import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DateTimeRangePicker } from '../DateTimeRangePicker';
import type { TimeRangeValue } from '../time-range';

const now = new Date(2026, 5, 15, 12, 0);

export default function DateTimeRangePickerBasic() {
  const [range, setRange] = useState<TimeRangeValue | null>({ mode: 'relative', amount: 24, unit: 'hour' });
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Log window</FieldLabel>
        <DateTimeRangePicker value={range} onValueChange={setRange} locale="en-US" hourCycle={24} now={now} name="window" />
        <FieldDescription>Relative ranges end now; custom ranges are absolute.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Incident period</FieldLabel>
        <DateTimeRangePicker
          defaultValue={{ mode: 'absolute', start: new Date(2026, 5, 12, 8, 30), end: new Date(2026, 5, 12, 11, 0) }}
          locale="en-US"
          hourCycle={24}
          now={now}
          max={now}
        />
      </Field>
    </div>
  );
}
