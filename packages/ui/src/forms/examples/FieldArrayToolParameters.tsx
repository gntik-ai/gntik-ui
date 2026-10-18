import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n';
import { FieldArray, Form, FormField } from '..';

type Values = { steps: { tool: string; timeoutMs: number }[] };

export default function FieldArrayToolParameters() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const form = useForm<Values>({ defaultValues: { steps: [{ tool: 'search', timeoutMs: 3000 }] } });
  return (
    <Form form={form} onSubmit={() => setSaved(true)} className="flex flex-col gap-4">
      <FieldArray
        name="steps"
        control={form.control}
        label={t('fieldArray.examples.parameters')}
        description={t('fieldArray.examples.description')}
        defaultItem={{ tool: '', timeoutMs: 3000 }}
        max={3}
      >
        {(row) => (
          <>
            <FormField name={row.name('tool')} label={t('fieldArray.examples.tool')}>
              {(field) => <Input {...field} />}
            </FormField>
            <FormField name={row.name('timeoutMs')} label={t('fieldArray.examples.timeout')}>
              {(field) => (
                <Input {...field} type="number" onChange={(event) => field.onChange(event.target.valueAsNumber)} />
              )}
            </FormField>
          </>
        )}
      </FieldArray>
      <Button type="submit">{t('common.save')}</Button>
      {saved && <p role="status">{t('actionBar.saved')}</p>}
    </Form>
  );
}
