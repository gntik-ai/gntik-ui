import type { FormHTMLAttributes, ReactNode } from 'react';
import type { FieldPath, FieldValues, FormProviderProps, SubmitErrorHandler, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '../components/Field';
import { useFieldProps, type UseFieldPropsOptions, type UseFieldPropsResult } from './useFieldProps';

export interface FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>>
  extends UseFieldPropsOptions<TValues, TName> {
  name: TName;
  label?: ReactNode;
  /** Shows the required marker on the label (validation itself comes from `rules` or the schema). */
  required?: boolean;
  description?: ReactNode;
  className?: string;
  /** Renders the control: `{(field) => <Input {...field} />}`. Gets the field's state as the second argument. */
  children: (control: UseFieldPropsResult<TValues, TName>['controlProps'], state: UseFieldPropsResult<TValues, TName>) => ReactNode;
}

/**
 * A kit `Field` bound to a react-hook-form field: label, control, description and the field's
 * error message, with `aria-invalid` and `aria-describedby` wired by Base UI's Field.
 */
export function FormField<TValues extends FieldValues = FieldValues, TName extends FieldPath<TValues> = FieldPath<TValues>>({
  name,
  label,
  required,
  description,
  className,
  children,
  ...options
}: FormFieldProps<TValues, TName>) {
  const state = useFieldProps<TValues, TName>(name, options);
  return (
    <Field {...state.fieldProps} disabled={options.disabled} className={className}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      {children(state.controlProps, state)}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError match={!!state.error}>{state.error}</FieldError>
    </Field>
  );
}

export interface FormProps<TValues extends FieldValues, TTransformed = TValues>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onInvalid'> {
  /** The object returned by `useForm()`. */
  form: UseFormReturn<TValues, unknown, TTransformed>;
  onSubmit: SubmitHandler<TTransformed>;
  onInvalid?: SubmitErrorHandler<TValues>;
  children?: ReactNode;
}

/**
 * `<form noValidate>` + `FormProvider`: submits through `handleSubmit`, so a failed submit shows
 * every message and focuses the first invalid field (react-hook-form's `shouldFocusError`).
 */
export function Form<TValues extends FieldValues, TTransformed = TValues>({ form, onSubmit, onInvalid, children, ...props }: FormProps<TValues, TTransformed>) {
  const provider = form as unknown as FormProviderProps<TValues, unknown, TTransformed>;
  return (
    <FormProvider {...provider}>
      <form noValidate {...props} onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {children}
      </form>
    </FormProvider>
  );
}
