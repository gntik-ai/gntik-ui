import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldLabel } from '../../Field';
import { DateField } from '../DateField';

export default function DateFieldTime() {
  const { t } = useI18n();
  return (
    <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>{t('dateField.start')}</FieldLabel>
        <DateField defaultValue={new Date(2026, 9, 1, 14, 30)} granularity="minute" hourCycle={24} name="from" />
      </Field>
      <Field>
        <FieldLabel>{t('dateField.end')}</FieldLabel>
        <DateField defaultValue={new Date(2026, 9, 1, 17, 45, 30)} granularity="second" hourCycle={12} name="until" />
      </Field>
    </div>
  );
}
