import { useForm } from 'react-hook-form';
import { Button } from '../../../components/Button';
import { FormDialog } from '../../../components/FormDialog';
import { useI18n } from '../../../i18n';
import { SchemaFields, useFormDialog } from '../..';
export default function SchemaFormDialog() {
  const { t } = useI18n();
  const form = useForm<Record<string, unknown>>();
  const dialog = useFormDialog(form, () => undefined);
  return (
    <FormDialog
      title={t('schemaForm.example.dialog')}
      description={t('schemaForm.example.dialogHelp')}
      trigger={<Button variant="secondary" />}
      {...dialog}
    >
      <SchemaFields
        control={form.control}
        schema={{
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string', title: t('schemaForm.example.query') },
            limit: { type: 'integer', title: t('schemaForm.example.limit'), default: 10, minimum: 1, maximum: 50 },
          },
        }}
      />
    </FormDialog>
  );
}
