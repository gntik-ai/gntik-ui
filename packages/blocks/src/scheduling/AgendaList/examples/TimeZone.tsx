import { I18nProvider } from '@gntik-ai/ui';
import { AgendaList } from '../AgendaList';

const today = new Date('2026-04-15T13:00:00Z');
const events = [
  {
    id: 'morning',
    title: 'Morning run',
    start: new Date('2026-04-15T13:00:00Z'),
    end: new Date('2026-04-15T14:00:00Z'),
  },
  { id: 'late', title: 'Late run', start: new Date('2026-04-15T23:30:00Z'), end: new Date('2026-04-16T00:30:00Z') },
];

/** UTC provider default, New York prop override, then a Spanish Madrid provider. */
export default function TimeZone() {
  return (
    <div className="space-y-6">
      <I18nProvider locale="en-US" timeZone="UTC">
        <AgendaList today={today} events={events} />
        <AgendaList today={today} events={events} timeZone="America/New_York" />
      </I18nProvider>
      <I18nProvider locale="es-ES" timeZone="Europe/Madrid">
        <AgendaList today={today} events={events} />
      </I18nProvider>
    </div>
  );
}
