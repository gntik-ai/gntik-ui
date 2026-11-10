import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n';
import { Form, FormField, FormRootError, FormSubmit, type FormServerErrors } from '..';

interface Values {
  name: string;
  email: string;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Backend-only errors: a fake API answers with a taken name, a blocked email domain or a quota error.
 * The map lives in state, so Form applies it once per response.
 */
export default function FormServerErrors() {
  const { t } = useI18n();
  const [errors, setErrors] = useState<FormServerErrors>();
  const [created, setCreated] = useState(false);
  const count = useRef(0);
  const form = useForm<Values>({ defaultValues: { name: '', email: '' } });
  return (
    <Form
      form={form}
      errors={errors}
      onSubmit={async (values) => {
        await wait(300);
        setCreated(false);
        if (count.current >= 2) {
          setErrors({ '': t('forms.serverErrors.quota') });
          return;
        }
        const found: FormServerErrors = {};
        if (values.name.trim().toLowerCase() === 'billing') found.name = t('forms.serverErrors.taken');
        if (values.email.endsWith('@example.invalid')) found.email = t('forms.serverErrors.blockedDomain');
        setErrors(found);
        if (Object.keys(found).length === 0) {
          count.current += 1;
          setCreated(true);
        }
      }}
      className="grid w-full max-w-md gap-5"
      aria-label={t('forms.serverErrors.title')}
    >
      <FormField<Values, 'name'>
        name="name"
        label={t('forms.serverErrors.name')}
        description={t('forms.serverErrors.hint')}
        rules={{ required: t('forms.serverErrors.required') }}
      >
        {(field) => <Input {...field} autoComplete="off" />}
      </FormField>
      <FormField<Values, 'email'>
        name="email"
        label={t('forms.serverErrors.email')}
        rules={{ required: t('forms.serverErrors.required') }}
      >
        {(field) => <Input {...field} type="email" autoComplete="email" />}
      </FormField>
      <FormRootError />
      <div className="flex items-center gap-3">
        <FormSubmit>{t('forms.serverErrors.create')}</FormSubmit>
        <p role="status" className="text-[12px] text-muted-foreground">
          {created ? t('forms.serverErrors.created') : ''}
        </p>
      </div>
    </Form>
  );
}
