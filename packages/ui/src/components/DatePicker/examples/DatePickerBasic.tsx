import { useState } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../Field';
import { DatePicker } from '../DatePicker';

const today = new Date(2026, 5, 15);
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export default function DatePickerBasic() {
  const [release, setRelease] = useState<Date | null>(new Date(2026, 5, 18));
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Release date</FieldLabel>
        <DatePicker value={release} onValueChange={setRelease} locale="en-US" weekStartsOn={1} today={today} min={today} isDateDisabled={isWeekend} name="release" />
        <FieldDescription>Releases ship on weekdays only.</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>Invoice due</FieldLabel>
        <DatePicker locale="en-US" today={today} formatOptions={{ dateStyle: 'long' }} invalid />
        <FieldError match>Choose a due date.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Contract start</FieldLabel>
        <DatePicker defaultValue={new Date(2026, 0, 1)} locale="en-US" disabled />
      </Field>
      <DatePicker aria-label="Report date" size="sm" locale="en-US" today={today} placeholder="Any day" />
    </div>
  );
}
