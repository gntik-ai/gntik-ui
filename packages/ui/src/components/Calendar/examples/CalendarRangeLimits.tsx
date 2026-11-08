import { useI18n } from '../../../i18n/I18nProvider';
import { Calendar } from '../Calendar';

const today = new Date(2026, 2, 10);

export default function CalendarRangeLimits() {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap gap-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('calendar.examples.rangeLimits')}</p>
        <Calendar
          aria-label={t('calendar.examples.rangeLimits')}
          mode="range"
          today={today}
          minRange={3}
          maxRange={7}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('calendar.examples.sameMonth')}</p>
        <Calendar
          aria-label={t('calendar.examples.sameMonth')}
          mode="range"
          today={today}
          numberOfMonths={2}
          isDateDisabled={(date, { rangeStart }) => !!rangeStart && date.getMonth() !== rangeStart.getMonth()}
        />
      </div>
    </div>
  );
}
