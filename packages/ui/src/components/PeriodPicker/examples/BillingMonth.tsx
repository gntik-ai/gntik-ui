import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { PeriodPicker } from '../PeriodPicker';

export default function BillingMonth() {
  const { t } = useI18n();
  return (
    <Field className="max-w-xs">
      <FieldLabel>{t('periodPicker.billingMonth')}</FieldLabel>
      <PeriodPicker
        granularity="month"
        name="billing-month"
        today={new Date(2026, 9, 17)}
        defaultValue={new Date(2026, 2, 1)}
      />
      <FieldDescription>{t('periodPicker.wholePeriodDescription')}</FieldDescription>
    </Field>
  );
}
