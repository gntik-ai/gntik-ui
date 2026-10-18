import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Field, FieldLabel } from '../../components/Field';
import { NumberInput } from '../../components/NumberInput';
import { Switch } from '../../components/Switch';
import { useI18n } from '../../i18n';
import { Form, useFieldProps, toValueProps, toCheckedProps } from '..';

type Values = { count: number; alerts: boolean };

/** The helpers also work with hand-built Fields and an explicit control. */
export default function FormBindingsHelpers() {
  const { t } = useI18n();
  const [saved, setSaved] = useState<Values | null>(null);
  const form = useForm<Values>({ defaultValues: { count: 1, alerts: false } });
  const count = useFieldProps('count', { control: form.control });
  const alerts = useFieldProps('alerts', { control: form.control });
  return (
    <Form form={form} onSubmit={setSaved} aria-label={t('forms.bindings.helpers')} className="grid gap-4">
      <Field {...count.fieldProps}>
        <FieldLabel>{t('forms.bindings.count')}</FieldLabel>
        <NumberInput {...toValueProps(count.controlProps)} />
      </Field>
      <Field {...alerts.fieldProps}>
        <FieldLabel>{t('forms.bindings.alerts')}</FieldLabel>
        <Switch {...toCheckedProps(alerts.controlProps)} />
      </Field>
      <Button type="submit">{t('common.save')}</Button>
      <p role="status" className="text-sm text-muted-foreground">
        {saved
          ? t('forms.bindings.helpersSaved', {
              count: saved.count,
              enabled: t(saved.alerts ? 'common.yes' : 'common.no'),
            })
          : ''}
      </p>
    </Form>
  );
}
