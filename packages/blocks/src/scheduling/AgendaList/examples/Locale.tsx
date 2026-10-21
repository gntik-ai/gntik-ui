import { I18nProvider, useI18n } from '@gntik-ai/ui';
import { AgendaList } from '../AgendaList';

function LocaleAgenda({ hourCycle }: { hourCycle?: 'h23' }) {
  const { locale, t } = useI18n();
  return (
    <AgendaList
      title={`${t('calendar.agenda')} (${locale}${hourCycle ? `, ${hourCycle}` : ''})`}
      hourCycle={hourCycle}
    />
  );
}

/** Compare US defaults, Spanish defaults, and explicit overrides under US English. */
export default function Locale() {
  return (
    <div className="space-y-6">
      <I18nProvider locale="en-US">
        <LocaleAgenda />
      </I18nProvider>
      <I18nProvider locale="es-ES">
        <LocaleAgenda />
      </I18nProvider>
      <I18nProvider locale="en-US">
        <LocaleAgenda hourCycle="h23" />
      </I18nProvider>
    </div>
  );
}
