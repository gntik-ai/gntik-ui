import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import type { DateRange } from '../../Calendar/calendar-utils';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DateRangePicker } from '../DateRangePicker';

const today = new Date(2026, 9, 17);

export default function DateRangePickerEditable() {
  const { t, formatDate } = useI18n();
  const [range, setRange] = useState<DateRange>({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 10) });
  const text = (date: Date | null) => (date ? formatDate(date, { dateStyle: 'medium' }) : '–');
  return (
    <div className="max-w-md">
      <Field>
        <FieldLabel>{t('datePicker.examples.auditWindow')}</FieldLabel>
        <DateRangePicker editable today={today} value={range} onValueChange={setRange} name="auditWindow" />
        <FieldDescription>
          {t('datePicker.examples.auditWindowHint')}{' '}
          {t('datePicker.examples.typedValue', { value: `${text(range.start)} – ${text(range.end)}` })}
        </FieldDescription>
      </Field>
    </div>
  );
}
