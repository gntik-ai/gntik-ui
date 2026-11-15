import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import type { DateRange } from '../../Calendar/calendar-utils';
import { Field, FieldLabel } from '../../Field';
import { DateRangeField } from '../DateRangeField';

export default function DateRangeFieldBasic() {
  const { t } = useI18n();
  const [range, setRange] = useState<DateRange>({
    start: new Date('2026-10-01T00:00:00Z'),
    end: new Date('2026-10-10T00:00:00Z'),
  });
  return (
    <Field className="max-w-lg">
      <FieldLabel>{t('dateField.label')}</FieldLabel>
      <DateRangeField utc value={range} onValueChange={setRange} name="window" />
    </Field>
  );
}
