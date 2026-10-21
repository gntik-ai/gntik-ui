import { I18nProvider } from '@gntik-ai/ui';
import { MonthCalendar } from '../MonthCalendar';

/** Compare US defaults, Spanish defaults, and explicit overrides under US English. */
export default function Locale() {
  return (
    <div className="space-y-6">
      <I18nProvider locale="en-US">
        <MonthCalendar />
      </I18nProvider>
      <I18nProvider locale="es-ES">
        <MonthCalendar />
      </I18nProvider>
      <I18nProvider locale="en-US">
        <MonthCalendar weekStartsOn={1} hourCycle="h23" />
      </I18nProvider>
    </div>
  );
}
