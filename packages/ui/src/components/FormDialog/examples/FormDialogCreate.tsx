import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { Field, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import { FormDialog } from '../FormDialog';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Create dialog: the submit is pending for a moment, then the dialog closes and resets. */
export default function FormDialogCreate() {
  const { t } = useI18n();
  return (
    <FormDialog
      title={t('formDialog.example.openCreate')}
      description={t('formDialog.example.createDescription')}
      trigger={<Button />}
      onSubmit={() => wait(600)}
    >
      <Field>
        <FieldLabel>{t('formDialog.example.name')}</FieldLabel>
        <Input name="name" placeholder={t('formDialog.example.namePlaceholder')} autoComplete="off" />
      </Field>
      <Field>
        <FieldLabel>{t('formDialog.example.limit')}</FieldLabel>
        <Input name="limit" inputMode="numeric" defaultValue="10000" autoComplete="off" />
      </Field>
    </FormDialog>
  );
}
