import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DatePicker } from '../DatePicker';

const today = new Date(2026, 2, 11);

export default function DatePickerMonth() {
  const { t } = useI18n();
  const [month, setMonth] = useState<Date | null>(new Date(2026, 2, 1));
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>{t('datePicker.examples.billingMonth')}</FieldLabel>
        <DatePicker
          granularity="month"
          value={month}
          onValueChange={setMonth}
          locale="en-US"
          today={today}
          max={new Date(2026, 11, 31)}
          name="billingMonth"
        />
        <FieldDescription>{t('datePicker.examples.billingMonthHint')}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{t('datePicker.examples.payrollWeek')}</FieldLabel>
        <DatePicker
          granularity="week"
          weekStartsOn={1}
          defaultValue={new Date(2026, 2, 4)}
          locale="en-US"
          today={today}
          name="payrollWeek"
        />
        <FieldDescription>{t('datePicker.examples.payrollWeekHint')}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{t('datePicker.examples.fiscalYear')}</FieldLabel>
        <DatePicker granularity="year" defaultValue={new Date(2026, 0, 1)} locale="en-US" today={today} />
      </Field>
    </div>
  );
}
