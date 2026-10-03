import { useState } from 'react';
import { formatDateRange, type DateRange } from '../../Calendar/calendar-utils';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DateRangePicker } from '../DateRangePicker';

const today = new Date(2026, 5, 15);

export default function DateRangePickerPresets() {
  const [range, setRange] = useState<DateRange>({ start: new Date(2026, 5, 9), end: today });
  return (
    <div className="max-w-sm">
      <Field>
        <FieldLabel>Usage period</FieldLabel>
        <DateRangePicker value={range} onValueChange={setRange} locale="en-US" weekStartsOn={0} today={today} max={today} name="period" />
        <FieldDescription>Showing deployments from {formatDateRange(range, 'en-US', { month: 'short', day: 'numeric' })}.</FieldDescription>
      </Field>
    </div>
  );
}
