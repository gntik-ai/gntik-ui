import { useI18n, I18nProvider } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DatePicker } from '../DatePicker';

const value = new Date('2026-01-15T02:00:17Z');

export default function DatePickerUtc() {
  const { t } = useI18n();
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>{t('datePicker.zonedExampleLabel')}</FieldLabel>
        <DatePicker withTime withSeconds timeZone="UTC" locale="en-US" defaultValue={value} name="runAt" />
        <FieldDescription>{t('datePicker.zonedExampleDescription')}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{t('datePicker.hiddenZoneExampleLabel')}</FieldLabel>
        <DatePicker withTime timeZone="UTC" hideTimeZone locale="en-US" defaultValue={value} />
      </Field>
      <I18nProvider locale="en-US" timeZone="UTC">
        <Field>
          <FieldLabel>{t('datePicker.utcDateExampleLabel')}</FieldLabel>
          <DatePicker defaultValue={value} name="utcDay" />
        </Field>
      </I18nProvider>
    </div>
  );
}
