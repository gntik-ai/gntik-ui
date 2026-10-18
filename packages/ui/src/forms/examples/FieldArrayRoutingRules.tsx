import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n';
import { FieldArray, Form, FormField } from '..';

type Values = { rules: { destination: string; weight: number }[] };

export default function FieldArrayRoutingRules() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const form = useForm<Values>({
    defaultValues: {
      rules: [
        { destination: 'primary', weight: 50 },
        { destination: 'fallback', weight: 50 },
      ],
    },
  });
  return (
    <Form form={form} onSubmit={() => setSaved(true)} className="flex flex-col gap-4">
      <FieldArray
        name="rules"
        control={form.control}
        label={t('fieldArray.examples.routing')}
        defaultItem={{ destination: '', weight: 0 }}
        layout="card"
        reorderable
        duplicable
        min={1}
      >
        {(row) => (
          <>
            <FormField name={row.name('destination')} label={t('fieldArray.examples.destination')}>
              {(field) => <Input {...field} />}
            </FormField>
            <FormField name={row.name('weight')} label={t('fieldArray.examples.weight')}>
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
