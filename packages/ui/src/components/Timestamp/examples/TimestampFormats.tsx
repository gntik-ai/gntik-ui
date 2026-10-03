import { Timestamp } from '../Timestamp';

const RELEASED = '2026-09-14T09:30:00Z';

export default function TimestampFormats() {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[13px]">
      <dt className="text-muted-foreground">Relative</dt>
      <dd><Timestamp value={RELEASED} tone="default" /></dd>
      <dt className="text-muted-foreground">Absolute (en-US)</dt>
      <dd><Timestamp value={RELEASED} format="absolute" locale="en-US" tone="default" /></dd>
      <dt className="text-muted-foreground">Absolute (de-DE, date only)</dt>
      <dd><Timestamp value={RELEASED} format="absolute" locale="de-DE" dateOptions={{ dateStyle: 'long' }} tone="default" /></dd>
    </dl>
  );
}
