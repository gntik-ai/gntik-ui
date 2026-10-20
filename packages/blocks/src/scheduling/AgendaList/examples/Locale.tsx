import { I18nProvider } from '@gntik-ai/ui';
import { AgendaList } from '../AgendaList';

/** Compare US defaults, Spanish defaults, and explicit overrides under US English. */
export default function Locale() {
  return (
    <div className="space-y-6">
      <I18nProvider locale="en-US">
        <AgendaList />
      </I18nProvider>
      <I18nProvider locale="es-ES">
        <AgendaList />
      </I18nProvider>
      <I18nProvider locale="en-US">
        <AgendaList hourCycle="h23" />
      </I18nProvider>
    </div>
  );
}
