import { Field, FieldDescription, FieldLabel } from '../../Field';
import { useI18n } from '../../../i18n';
import { Input } from '../Input';

export default function InputCounter() {
  const { t } = useI18n();
  return (
    <div className="flex max-w-md flex-col gap-4">
      <Field>
        <FieldLabel>{t('charCount.resourceLabel')}</FieldLabel>
        <Input showCount maxLength={63} trailingAddon=".svc" defaultValue="api" clearable />
        <FieldDescription>{t('charCount.resourceHint')}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{t('charCount.aliasLabel')}</FieldLabel>
        <Input showCount />
        <FieldDescription>{t('charCount.aliasHint')}</FieldDescription>
      </Field>
    </div>
  );
}
