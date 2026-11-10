import { Field, FieldDescription, FieldLabel } from '../../Field';
import { useI18n } from '../../../i18n/I18nProvider';
import { PasswordInput } from '../PasswordInput';

export default function PasswordInputPolicy() {
  const { t } = useI18n();
  return (
    <Field className="max-w-md">
      <FieldLabel>{t('password.examples.label')}</FieldLabel>
      <PasswordInput
        showStrength
        rules={{ minLength: 12, lowercase: true, uppercase: true, number: true }}
        requirements={[
          { id: 'noSpaces', label: t('password.examples.noSpaces'), test: (password) => !/\s/.test(password) },
        ]}
      />
      <FieldDescription>{t('password.examples.description')}</FieldDescription>
    </Field>
  );
}
