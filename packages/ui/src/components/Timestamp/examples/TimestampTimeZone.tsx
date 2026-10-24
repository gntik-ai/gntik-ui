import { I18nProvider, useI18n, fromZonedParts, zonedParts, formatTimeZoneLabel, isValidTimeZone } from '../../../i18n';
import { Timestamp } from '../Timestamp';

const instant = fromZonedParts({ year: 2026, month: 4, day: 15, hour: 9, minute: 30 }, 'Europe/Madrid')!;

function DisplayClock() {
  const { formatDate, timeZone, t } = useI18n();
  const parts = zonedParts(instant, timeZone);
  return (
    <div className="space-y-2 text-[13px] text-foreground">
      <p>{t('scheduling.timeZone', { zone: `${timeZone} (${formatTimeZoneLabel(timeZone, instant, 'en-US')})` })}</p>
      <p>{formatDate(instant, { timeStyle: 'short' })}</p>
      <Timestamp value={instant} format="absolute" dateOptions={{ timeStyle: 'short' }} />
      <p className="text-muted-foreground">
        {parts.year}-{String(parts.month).padStart(2, '0')}-{String(parts.day).padStart(2, '0')}
      </p>
      <Timestamp value={instant} format="absolute" dateOptions={{ timeStyle: 'short', timeZone: 'UTC' }} />
    </div>
  );
}

/** Provider clock and absolute Timestamp agree; an explicit UTC option still wins. */
export default function TimestampTimeZone() {
  return (
    <I18nProvider locale="en-GB" timeZone={isValidTimeZone('Europe/Madrid') ? 'Europe/Madrid' : 'system'}>
      <DisplayClock />
    </I18nProvider>
  );
}
