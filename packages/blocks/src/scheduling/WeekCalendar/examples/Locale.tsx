import { I18nProvider } from '@gntik-ai/ui';
import { WeekCalendar } from '../WeekCalendar';

/** Compare US defaults, Spanish defaults, and explicit overrides under US English. */
export default function Locale() {
  return (
    <div className="space-y-6">
      <I18nProvider locale="en-US">
        <WeekCalendar />
      </I18nProvider>
      <I18nProvider locale="es-ES">
        <WeekCalendar />
      </I18nProvider>
      <I18nProvider locale="en-US">
        <WeekCalendar weekStartsOn={1} hourCycle="h23" />
      </I18nProvider>
    </div>
  );
}
