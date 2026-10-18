import { Calendar } from '../Calendar';

const date = new Date(2026, 2, 15);

export default function CalendarViews() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Calendar locale="en-US" today={date} defaultValue={date} />
      <Calendar locale="en-US" today={date} defaultValue={date} captionLayout="select" />
    </div>
  );
}
