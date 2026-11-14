import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DatePicker } from '../DatePicker';

const today = new Date(2026, 9, 17);

export default function DatePickerEditable() {
  const { t, formatDate } = useI18n();
  const [expiry, setExpiry] = useState<Date | null>(new Date(2026, 11, 31));
  const [runAt, setRunAt] = useState<Date | null>(new Date(Date.UTC(2026, 9, 20, 14, 30)));
  const shown = (date: Date | null, options: Intl.DateTimeFormatOptions) =>
    t('datePicker.examples.typedValue', { value: date ? formatDate(date, options) : t('datePicker.examples.noValue') });
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>{t('datePicker.examples.keyExpiry')}</FieldLabel>
        <DatePicker editable today={today} value={expiry} onValueChange={setExpiry} min={today} name="keyExpiry" />
        <FieldDescription>
          {t('datePicker.examples.keyExpiryHint')} {shown(expiry, { dateStyle: 'medium' })}
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{t('datePicker.examples.runAtUtc')}</FieldLabel>
        <DatePicker
          editable
          withTime
          timeZone="UTC"
          today={today}
          value={runAt}
          onValueChange={setRunAt}
          name="runAt"
        />
        <FieldDescription>
          {t('datePicker.examples.runAtUtcHint')}{' '}
          {shown(runAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })}
        </FieldDescription>
      </Field>
    </div>
  );
}
