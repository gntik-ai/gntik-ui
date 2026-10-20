import { I18nProvider, localeWeekStart } from '@gntik-ai/ui';
import { Calendar } from '../Calendar';

/** The exported helper matches the Calendar and scheduling defaults. */
export default function CalendarLocale() {
  return (
    <div className="flex flex-wrap gap-6">
      {['en-US', 'es-ES'].map((locale) => (
        <I18nProvider key={locale} locale={locale}>
          <Calendar defaultMonth={new Date(2026, 3, 1)} weekStartsOn={localeWeekStart(locale)} />
        </I18nProvider>
      ))}
    </div>
  );
}
