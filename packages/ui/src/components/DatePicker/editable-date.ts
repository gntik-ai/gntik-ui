import { fromZonedParts, zonedParts } from '../../i18n/time-zone';

/** First or last second of the day `date` has in `zone`, so a date-time field bounds by calendar day like the grid. */
export function dayBoundary(date: Date, zone: string, edge: 'start' | 'end'): Date {
  const p = zonedParts(date, zone);
  const last = edge === 'end';
  return (
    fromZonedParts(
      { year: p.year, month: p.month, day: p.day, hour: last ? 23 : 0, minute: last ? 59 : 0, second: last ? 59 : 0 },
      zone,
      'compatible',
    ) ?? date
  );
}
