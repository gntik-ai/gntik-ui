import { useState } from 'react';
import { formatDateRange, type DateRange } from '../calendar-utils';
import { Calendar } from '../Calendar';

export default function CalendarRange() {
  const [range, setRange] = useState<DateRange>({ start: new Date(2026, 5, 8), end: new Date(2026, 5, 19) });
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Calendar
          mode="range"
          aria-label="Billing period"
          locale="en-US"
          weekStartsOn={0}
          numberOfMonths={2}
          today={new Date(2026, 5, 15)}
          max={new Date(2026, 11, 31)}
          value={range}
          onValueChange={setRange}
        />
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Invoice period: <span className="font-medium text-foreground">{formatDateRange(range, 'en-US') || 'pick a start day'}</span>
      </p>
    </div>
  );
}
