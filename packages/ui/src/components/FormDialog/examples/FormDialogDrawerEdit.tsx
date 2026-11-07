import { Settings } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { Field, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import { FormDialog } from '../FormDialog';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Edit in a side drawer, keeping the list visible behind it. Kept mounted so a cancelled edit keeps its text. */
export default function FormDialogDrawerEdit() {
  const { t } = useI18n();
  return (
    <FormDialog
      variant="drawer"
      side="right"
      keepMounted
      title={t('formDialog.example.openEdit')}
      description={t('formDialog.example.editDescription')}
      trigger={<Button variant="secondary" icon={Settings} />}
      submitLabel={t('formDialog.example.saveChanges')}
      onSubmit={() => wait(600)}
    >
      <Field>
        <FieldLabel>{t('formDialog.example.name')}</FieldLabel>
        <Input name="name" defaultValue={t('formDialog.example.namePlaceholder')} autoComplete="off" />
      </Field>
      <Field>
        <FieldLabel>{t('formDialog.example.limit')}</FieldLabel>
        <Input name="limit" inputMode="numeric" defaultValue="10000" autoComplete="off" />
      </Field>
      <Field>
        <FieldLabel>{t('formDialog.example.region')}</FieldLabel>
        <Input name="region" defaultValue="eu-west-1" autoComplete="off" />
      </Field>
    </FormDialog>
  );
}
