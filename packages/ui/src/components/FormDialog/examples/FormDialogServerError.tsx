import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { Field, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import { FormDialog } from '../FormDialog';

/** A returned string keeps the dialog open and shows it at the top of the body. */
export default function FormDialogServerError() {
  const { t } = useI18n();
  return (
    <FormDialog
      title={t('formDialog.example.openRename')}
      description={t('formDialog.example.renameDescription')}
      trigger={<Button variant="secondary" />}
      onSubmit={() =>
        new Promise<string>((resolve) => setTimeout(() => resolve(t('formDialog.example.nameTaken')), 300))
      }
    >
      <Field>
        <FieldLabel>{t('formDialog.example.name')}</FieldLabel>
        <Input name="name" defaultValue={t('formDialog.example.namePlaceholder')} autoComplete="off" />
      </Field>
    </FormDialog>
  );
}
