import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldLabel } from '../../Field';
import { PeriodCalendar } from '../PeriodCalendar';
import { PeriodPicker } from '../PeriodPicker';

export default function Year() {
  const { t } = useI18n();
  return (
    <div className="flex max-w-xs flex-col gap-4">
      <Field>
        <FieldLabel>{t('periodPicker.reportingYear')}</FieldLabel>
        <PeriodPicker granularity="year" name="reporting-year" today={new Date(2026, 9, 17)} />
      </Field>
      <PeriodCalendar granularity="year" today={new Date(2026, 9, 17)} aria-label={t('periodPicker.yearCalendar')} />
    </div>
  );
}
