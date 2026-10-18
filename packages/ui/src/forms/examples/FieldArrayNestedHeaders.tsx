import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n';
import { FieldArray, Form, FormField } from '..';

type Values = { steps: { tool: string; headers: { key: string; value: string }[] }[] };

export default function FieldArrayNestedHeaders() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const form = useForm<Values>({
    defaultValues: {
      steps: [
        {
          tool: 'search',
          headers: [
            { key: 'Accept', value: 'application/json' },
            { key: 'Content-Type', value: 'application/json' },
          ],
        },
      ],
    },
  });
  return (
    <Form form={form} onSubmit={() => setSaved(true)} className="flex flex-col gap-4">
      <FieldArray
        name="steps"
        control={form.control}
        label={t('fieldArray.examples.steps')}
        defaultItem={() => ({ tool: '', headers: [] })}
        layout="card"
        reorderable
        duplicable
      >
        {(row) => (
          <>
            <FormField name={row.name('tool')} label={t('fieldArray.examples.tool')}>
              {(field) => <Input {...field} />}
            </FormField>
            <FieldArray
              name={row.name('headers')}
              control={form.control}
              label={t('fieldArray.examples.headers')}
              defaultItem={{ key: '', value: '' }}
              reorderable
            >
              {(header) => (
                <>
                  <FormField name={header.name('key')} label={t('fieldArray.examples.key')}>
                    {(field) => <Input {...field} />}
                  </FormField>
                  <FormField name={header.name('value')} label={t('fieldArray.examples.value')}>
                    {(field) => <Input {...field} />}
                  </FormField>
                </>
              )}
            </FieldArray>
          </>
        )}
      </FieldArray>
      <Button type="submit">{t('common.save')}</Button>
      {saved && <p role="status">{t('actionBar.saved')}</p>}
    </Form>
  );
}
