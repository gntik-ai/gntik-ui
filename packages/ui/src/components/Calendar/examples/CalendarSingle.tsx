import { useState } from 'react';
import { formatDate } from '../calendar-utils';
import { Calendar } from '../Calendar';

const today = new Date(2026, 5, 15);
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export default function CalendarSingle() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 5, 18));
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Calendar
          aria-label="Deployment date"
          locale="en-US"
          weekStartsOn={1}
          today={today}
          min={today}
          isDateDisabled={isWeekend}
          value={date}
          onValueChange={setDate}
        />
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Deploy on <span className="font-medium text-foreground">{date ? formatDate(date, 'en-US', { dateStyle: 'full' }) : '—'}</span>.
        Weekends and past days are unavailable.
      </p>
    </div>
  );
}
