import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import type { DateRange } from '../../Calendar/calendar-utils';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DateRangePicker } from '../DateRangePicker';

const today = new Date(2026, 9, 17);

export default function DateRangePickerQuarters() {
  const { t } = useI18n();
  const [range, setRange] = useState<DateRange>({ start: new Date(2026, 0, 1), end: new Date(2026, 5, 30) });
  return (
    <div className="max-w-sm">
      <Field>
        <FieldLabel>{t('datePicker.examples.reportingQuarters')}</FieldLabel>
        <DateRangePicker
          granularity="quarter"
          value={range}
          onValueChange={setRange}
          locale="en-US"
          today={today}
          name="reportingQuarters"
        />
        <FieldDescription>{t('datePicker.examples.reportingQuartersHint')}</FieldDescription>
      </Field>
    </div>
  );
}
