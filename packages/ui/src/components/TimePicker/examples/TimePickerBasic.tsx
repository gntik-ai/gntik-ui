import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { TimePicker } from '../TimePicker';

export default function TimePickerBasic() {
  const [start, setStart] = useState<string | null>('09:00');
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Maintenance window starts</FieldLabel>
        <TimePicker value={start} onValueChange={setStart} hourCycle={24} step={15} name="window-start" />
        <FieldDescription>Arrow keys move in 15-minute steps.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Reminder</FieldLabel>
        <TimePicker defaultValue="17:30" hourCycle={12} locale="en-US" />
      </Field>
      <Field>
        <FieldLabel>Timeout at</FieldLabel>
        <TimePicker defaultValue="00:05:30" withSeconds hourCycle={24} />
      </Field>
      <Field disabled>
        <FieldLabel>Locked time</FieldLabel>
        <TimePicker defaultValue="12:00" hourCycle={24} disabled />
      </Field>
    </div>
  );
}
