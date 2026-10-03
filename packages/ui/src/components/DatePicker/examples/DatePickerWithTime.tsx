import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DatePicker } from '../DatePicker';

const today = new Date(2026, 5, 15);

export default function DatePickerWithTime() {
  const [at, setAt] = useState<Date | null>(new Date(2026, 5, 18, 14, 30));
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Publish at</FieldLabel>
        <DatePicker withTime value={at} onValueChange={setAt} locale="en-US" hourCycle={24} timeStep={15} today={today} min={today} name="publish-at" />
        <FieldDescription>Pick the day, then the time; Done closes the picker.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Call reminder</FieldLabel>
        <DatePicker withTime locale="en-US" hourCycle={12} today={today} />
      </Field>
    </div>
  );
}
