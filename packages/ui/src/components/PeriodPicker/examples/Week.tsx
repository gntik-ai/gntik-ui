import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { PeriodPicker } from '../PeriodPicker';

export default function Week() {
  const { t } = useI18n();
  return (
    <Field className="max-w-xs">
      <FieldLabel>{t('periodPicker.reportingWeek')}</FieldLabel>
      <PeriodPicker granularity="week" name="reporting-week" today={new Date(2026, 8, 30)} />
      <FieldDescription>{t('periodPicker.isoDescription')}</FieldDescription>
    </Field>
  );
}
