import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldLabel } from '../../Field';
import { DateTimeRangePicker } from '../DateTimeRangePicker';
import type { TimeRangeValue } from '../time-range';

const value: TimeRangeValue = {
  mode: 'absolute',
  start: new Date('2026-01-15T02:00:00Z'),
  end: new Date('2026-01-15T04:00:00Z'),
};
const now = new Date('2026-01-15T12:00:00Z');

export default function DateTimeRangePickerUtc() {
  const { t } = useI18n();
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>{t('timeRange.zonedExampleLabel')}</FieldLabel>
        <DateTimeRangePicker
          timeZone="UTC"
          locale="en-US"
          hourCycle={24}
          defaultValue={value}
          now={now}
          name="window"
        />
      </Field>
      <Field>
        <FieldLabel>{t('timeRange.hiddenZoneExampleLabel')}</FieldLabel>
        <DateTimeRangePicker timeZone="UTC" hideTimeZone locale="en-US" hourCycle={24} defaultValue={value} now={now} />
      </Field>
    </div>
  );
}
