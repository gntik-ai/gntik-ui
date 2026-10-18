import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { PeriodPicker } from '../PeriodPicker';

export default function QuarterRange() {
  const { t } = useI18n();
  return (
    <Field className="max-w-sm">
      <FieldLabel>{t('periodPicker.reportingQuarters')}</FieldLabel>
      <PeriodPicker
        granularity="quarter"
        mode="range"
        name="reporting-quarters"
        today={new Date(2026, 9, 17)}
        defaultValue={{ start: new Date(2026, 0, 1), end: new Date(2026, 5, 30) }}
      />
      <FieldDescription>{t('periodPicker.rangeDescription')}</FieldDescription>
    </Field>
  );
}
