import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DatePicker } from '../DatePicker';

const today = new Date(2026, 5, 15);
const audit = new Date(2026, 8, 1);

export default function DatePickerVisibleMonth() {
  const { t, formatDate } = useI18n();
  const [month, setMonth] = useState(new Date(2026, 5, 1));
  const monthName = (d: Date) => formatDate(d, { month: 'long', year: 'numeric' });
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>{t('datePicker.examples.shipmentDate')}</FieldLabel>
        <DatePicker today={today} month={month} onMonthChange={setMonth} name="shipment" />
        <FieldDescription>{t('datePicker.examples.visibleMonth', { month: monthName(month) })}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{t('datePicker.examples.auditDate')}</FieldLabel>
        <DatePicker today={today} defaultMonth={audit} name="audit" />
        <FieldDescription>{t('datePicker.examples.opensOnMonth', { month: monthName(audit) })}</FieldDescription>
      </Field>
    </div>
  );
}
