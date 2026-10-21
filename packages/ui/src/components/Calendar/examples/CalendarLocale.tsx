import { I18nProvider, localeWeekStart, useI18n } from '@gntik-ai/ui';
import { Calendar } from '../Calendar';

function LocaleCalendar() {
  const { locale, t } = useI18n();
  return (
    <Calendar
      aria-label={`${t('calendar.label')} (${locale})`}
      defaultMonth={new Date(2026, 3, 1)}
      weekStartsOn={localeWeekStart(locale)}
    />
  );
}

/** The exported helper matches the Calendar and scheduling defaults. */
export default function CalendarLocale() {
  return (
    <div className="flex flex-wrap gap-6">
      {['en-US', 'es-ES'].map((locale) => (
        <I18nProvider key={locale} locale={locale}>
          <LocaleCalendar />
        </I18nProvider>
      ))}
    </div>
  );
}
