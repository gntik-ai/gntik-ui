import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DatePicker } from '../DatePicker';

const today = new Date(2026, 5, 15);
const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export default function DatePickerVisibleMonth() {
  const [month, setMonth] = useState(new Date(2026, 5, 1));
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Shipment date</FieldLabel>
        <DatePicker locale="en-US" today={today} month={month} onMonthChange={setMonth} name="shipment" />
        <FieldDescription>Visible month: {monthFormat.format(month)}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Audit date</FieldLabel>
        <DatePicker locale="en-US" today={today} defaultMonth={new Date(2026, 8, 1)} name="audit" />
        <FieldDescription>Opens on September 2026 until a date is picked.</FieldDescription>
      </Field>
    </div>
  );
}
