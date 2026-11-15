import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormSubmit } from '..';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n';

type Values = { slug: string };

export default function FormAsyncValidation() {
  const { t } = useI18n();
  const form = useForm<Values>({ defaultValues: { slug: '' } });
  const [saved, setSaved] = useState(false);
  return (
    <Form form={form} onSubmit={() => setSaved(true)} className="grid max-w-md gap-5" data-async-validation-example="">
      <FormField<Values>
        name="slug"
        label={t('fieldStatus.slug')}
        description={t('fieldStatus.hint')}
        asyncDebounceMs={300}
        feedbackIcon
        success={t('fieldStatus.available')}
        warning={(value) => (value.length > 16 ? t('fieldStatus.warning') : null)}
        asyncValidate={(value, { signal }) =>
          new Promise((resolve) => {
            // The callback owns its request. This local demonstration needs no server.
            const timer = setTimeout(() => resolve(value === 'taken' ? t('fieldStatus.taken') : null), 700);
            signal.addEventListener(
              'abort',
              () => {
                clearTimeout(timer);
                resolve(null);
              },
              { once: true },
            );
          })
        }
      >
        {(control) => <Input {...control} />}
      </FormField>
      <FormSubmit />
      {saved && <p className="text-[13px] text-success-text">{t('fieldStatus.saved')}</p>}
    </Form>
  );
}
