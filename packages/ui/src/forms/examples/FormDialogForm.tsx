import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { FormDialog } from '../../components/FormDialog';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n';
import { FormField, schemaResolver, useFormDialog } from '..';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** react-hook-form inside a FormDialog: invalid values keep it open and focus the field; closing resets. */
export default function FormDialogForm() {
  const { t } = useI18n();
  const schema = z.object({
    name: z.string().trim().min(1, t('formDialog.example.nameRequired')),
    limit: z.string(),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: schemaResolver<Values>(schema),
    defaultValues: { name: '', limit: '10000' },
  });
  const dialog = useFormDialog(form, () => wait(600));
  return (
    <FormDialog
      title={t('formDialog.example.openForm')}
      description={t('formDialog.example.createDescription')}
      trigger={<Button variant="secondary" />}
      {...dialog}
    >
      <FormField<Values, 'name'> control={form.control} name="name" label={t('formDialog.example.name')} required>
        {(field) => <Input {...field} autoComplete="off" />}
      </FormField>
      <FormField<Values, 'limit'> control={form.control} name="limit" label={t('formDialog.example.limit')}>
        {(field) => <Input {...field} inputMode="numeric" autoComplete="off" />}
      </FormField>
    </FormDialog>
  );
}
