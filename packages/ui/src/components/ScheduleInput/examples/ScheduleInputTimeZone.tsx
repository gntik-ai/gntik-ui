import { I18nProvider } from '../../../i18n/I18nProvider';
import { ScheduleInput } from '../ScheduleInput';

/** No zone prop: the preview instants, formatted times and label inherit UTC. */
export default function ScheduleInputTimeZone() {
  return (
    <I18nProvider locale="en-GB" timeZone="UTC">
      <div className="max-w-xl">
        <ScheduleInput defaultValue="30 9 * * *" now={new Date('2026-04-15T07:30:00Z')} previewCount={3} />
      </div>
    </I18nProvider>
  );
}
