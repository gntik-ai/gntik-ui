import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DatePicker } from '../DatePicker';

export default function DatePickerEditable() {
  const { t } = useI18n();
  return (
    <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>{t('datePicker.examples.shipmentDate')}</FieldLabel>
        <DatePicker editable defaultValue={new Date(2026, 9, 1)} name="editableDate" />
        <FieldDescription>{t('datePicker.editableHint')}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{t('datePicker.zonedExampleLabel')}</FieldLabel>
        <DatePicker
          editable
          withTime
          withSeconds
          hourCycle={12}
          timeZone="UTC"
          defaultValue={new Date('2026-10-01T14:30:15Z')}
          name="editableTime"
        />
        <FieldDescription>{t('datePicker.editableTimeHint')}</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>{t('datePicker.examples.auditDate')}</FieldLabel>
        <DatePicker editable defaultValue={new Date(2026, 2, 3)} />
      </Field>
      <Field disabled>
        <FieldLabel>{t('datePicker.utcDateExampleLabel')}</FieldLabel>
        <DatePicker editable timeZone="UTC" defaultValue={new Date('2026-03-03T00:00:00Z')} />
      </Field>
    </div>
  );
}
