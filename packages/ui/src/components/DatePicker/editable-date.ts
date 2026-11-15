import { fromZonedParts, zonedParts } from '../../i18n/time-zone';
import { fieldDate, toDateDraft } from '../DateField/date-parts';

/** UTC is a carrier for zoned wall parts: host-local DST must never normalize typed time. */
export function editableWallDate(date: Date | null, zone: string): Date | null {
  if (!date || zone === 'system') return date;
  const p = zonedParts(date, zone);
  const wall = fieldDate(p.year, p.month - 1, p.day, true);
  wall.setUTCHours(p.hour, p.minute, p.second, p.millisecond);
  return wall;
}

export function editableInstant(date: Date | null, zone: string): Date | null {
  if (!date || zone === 'system') return date;
  const p = toDateDraft(date, true);
  return fromZonedParts(
    { year: p.year!, month: p.month!, day: p.day!, hour: p.hour!, minute: p.minute!, second: p.second! },
    zone,
  );
}
