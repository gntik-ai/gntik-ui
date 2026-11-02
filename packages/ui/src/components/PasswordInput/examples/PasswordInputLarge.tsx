import { Lock } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldLabel } from '../../Field';
import { PasswordInput } from '../PasswordInput';

export default function PasswordInputLarge() {
  const { t } = useI18n();
  return (
    <Field className="max-w-lg">
      <FieldLabel>{t('signIn.password')}</FieldLabel>
      <PasswordInput size="lg" leadingIcon={Lock} showStrength defaultValue="Correct-Horse-9" />
    </Field>
  );
}
