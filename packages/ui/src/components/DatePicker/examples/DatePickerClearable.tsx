import { useState } from 'react';
import { DatePicker } from '../DatePicker';
import { DateRangePicker } from '../DateRangePicker';
import { Field, FieldLabel } from '../../Field';

const date = new Date(2026, 5, 18, 9, 30);
export default function DatePickerClearable() {
  const [cleared, setCleared] = useState(false);
  return (
    <div className="grid max-w-sm gap-4">
      <Field>
        <FieldLabel>Expiry</FieldLabel>
        <DatePicker clearable defaultValue={date} onClear={() => setCleared(true)} name="expiry" />
      </Field>
      <DatePicker clearable withTime aria-label="Publish at" defaultValue={date} />
      <DateRangePicker
        clearable
        clearLabel="Reset period"
        aria-label="Period"
        defaultValue={{ start: date, end: new Date(2026, 5, 25) }}
        onClear={() => setCleared(true)}
      />
      <DatePicker clearable clearLabel="Reset review date" aria-label="Review date" defaultValue={date} />
      <DatePicker clearable readOnly aria-label="Fixed date" defaultValue={date} />
      <DateRangePicker clearable readOnly aria-label="Fixed period" defaultValue={{ start: date, end: date }} />
      <p className="text-sm text-muted-foreground">
        {cleared ? 'Date cleared.' : 'Clear from the field, the calendar popup, or with Delete.'}
      </p>
    </div>
  );
}
