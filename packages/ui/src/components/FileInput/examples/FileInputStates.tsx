import { useI18n } from '../../../i18n';
import { Field, FieldError, FieldLabel } from '../../Field';
import { FileInput } from '../FileInput';

export default function FileInputStates() {
  const { t } = useI18n();
  return (
    <div className="w-full max-w-sm space-y-4">
      <Field disabled>
        <FieldLabel>{t('fileInput.example.disabled')}</FieldLabel>
        <FileInput defaultValue={new File(['certificate'], 'managed.pem')} clearable />
      </Field>
      <Field invalid>
        <FieldLabel>{t('fileInput.example.invalid')}</FieldLabel>
        <FileInput invalid />
        <FieldError match>{t('fileInput.example.error')}</FieldError>
      </Field>
      <Field>
        <FieldLabel>{t('fileInput.example.directory')}</FieldLabel>
        <FileInput multiple directory />
      </Field>
      <Field>
        <FieldLabel>{t('fileInput.example.capture')}</FieldLabel>
        <FileInput accept="image/*" capture="environment" />
      </Field>
    </div>
  );
}
