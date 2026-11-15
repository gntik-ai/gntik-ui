import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DateRangePicker } from '../DateRangePicker';

export default function DateRangePickerEditable() {
  const { t } = useI18n();
  return (
    <Field className="max-w-2xl">
      <FieldLabel>{t('datePicker.rangePlaceholder')}</FieldLabel>
      <DateRangePicker
        editable
        presets={[]}
        maxRange={31}
        defaultValue={{ start: new Date(2026, 9, 1), end: new Date(2026, 9, 10) }}
        name="editableRange"
      />
      <FieldDescription>{t('datePicker.editableHint')}</FieldDescription>
    </Field>
  );
}
