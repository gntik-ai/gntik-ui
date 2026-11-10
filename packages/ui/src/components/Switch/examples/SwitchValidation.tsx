import { Switch } from '../Switch';
import { Field, FieldError, FieldLabel } from '../../Field/Field';
import { useI18n } from '../../../i18n/I18nProvider';

export default function SwitchValidation() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4" data-switch-invalid>
      {[false, true].map((checked) => (
        <Field key={String(checked)} invalid>
          <FieldLabel>{t('invalidControls.terms')}</FieldLabel>
          <Switch invalid defaultChecked={checked} />
          <FieldError>{t('invalidControls.acceptTerms')}</FieldError>
        </Field>
      ))}
    </div>
  );
}
