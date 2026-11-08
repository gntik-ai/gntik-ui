import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { formatDate, type DateRange } from '../../Calendar/calendar-utils';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DateRangePicker } from '../DateRangePicker';

const today = new Date(2026, 2, 10);

export default function DateRangePickerRetention() {
  const { t } = useI18n();
  const [draft, setDraft] = useState<DateRange>({ start: null, end: null });
  return (
    <div className="max-w-sm">
      <Field>
        <FieldLabel>{t('datePicker.examples.retentionLabel')}</FieldLabel>
        <DateRangePicker today={today} minRange={3} maxRange={90} onCalendarChange={setDraft} />
        <FieldDescription>
          {draft.start && !draft.end
            ? t('datePicker.examples.pendingStart', { date: formatDate(draft.start) })
            : t('datePicker.examples.retentionHint')}
        </FieldDescription>
      </Field>
    </div>
  );
}
