import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldLabel } from '../../Field';
import { DateField } from '../DateField';

export default function DateFieldBasic() {
  const { t } = useI18n();
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 1));
  return (
    <Field className="max-w-sm">
      <FieldLabel>{t('dateField.label')}</FieldLabel>
      <DateField value={date} onValueChange={setDate} name="date" />
    </Field>
  );
}
