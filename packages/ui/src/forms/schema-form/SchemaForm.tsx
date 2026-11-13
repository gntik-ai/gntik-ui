import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useI18n } from '../../i18n';
import { Form } from '../FormField';
import { FormSubmit } from '../FormActions';
import { issuesToErrors } from '../schemaResolver';
import { SchemaFields } from './SchemaFields';
import { initialValue, prepareValues } from './values';
import { validate } from './validate';
import { schemaFormVariants } from './schema-form.variants';
import type { SchemaFormProps, SchemaValues } from './types';

/** Schema-driven kit form, isolated in the optional forms entry. */
export function SchemaForm({
  schema,
  defaultValues,
  onSubmit,
  onChange,
  resolver,
  submitLabel,
  ...props
}: SchemaFormProps) {
  const { t } = useI18n();
  const builtin: Resolver<SchemaValues, unknown, SchemaValues> = (values) => {
    const issues = validate(schema, values, t);
    return issues.length
      ? { values: {}, errors: issuesToErrors<SchemaValues>(issues) }
      : { values: prepareValues(schema, values) as SchemaValues, errors: {} };
  };
  const form = useForm<SchemaValues, unknown, SchemaValues>({
    defaultValues: initialValue(schema, defaultValues) as SchemaValues,
    resolver: resolver ?? builtin,
  });
  useEffect(() => {
    if (!onChange) return;
    const subscription = form.watch((values) => onChange(prepareValues(schema, values) as SchemaValues));
    return () => subscription.unsubscribe();
  }, [form, onChange, schema]);
  return (
    <Form
      form={form}
      onSubmit={(values) => onSubmit(values)}
      aria-label={schema.title}
      className={schemaFormVariants().form()}
    >
      <SchemaFields schema={schema} {...props} />
      <FormSubmit disabled={props.disabled}>{submitLabel ?? t('common.save')}</FormSubmit>
    </Form>
  );
}
