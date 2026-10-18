import { createContext, useContext, type FormHTMLAttributes, type ReactNode } from 'react';
import type {
  FieldPath,
  FieldPathValue,
  FieldValues,
  FormProviderProps,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { cn } from '../utils/cn';
import { toValueProps, toCheckedProps, type ValueBindingProps, type CheckedBindingProps } from './bindings';
import { Field, FieldDescription, FieldError, FieldLabel } from '../components/Field';
import { useFieldProps, type UseFieldPropsOptions, type UseFieldPropsResult } from './useFieldProps';

export interface EnhancedFieldProps {
  disabled?: boolean;
  readOnly?: boolean;
}

export type EnhanceFieldProps = (field: { name: string }) => EnhancedFieldProps | undefined;
const FieldEnhancerContext = createContext<EnhanceFieldProps | undefined>(undefined);

export type FormFieldWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const widths: Record<FormFieldWidth, string> = {
  xs: 'max-w-[6.5rem]',
  sm: 'max-w-[13.5rem]',
  md: 'max-w-[20.5rem]',
  lg: 'max-w-[27.5rem]',
  xl: 'max-w-[34.5rem]',
};

export type FormFieldBinding = 'input' | 'value' | 'checked';

type BoundProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
  TBind extends FormFieldBinding,
> = TBind extends 'value'
  ? ValueBindingProps<FieldPathValue<TValues, TName>>
  : TBind extends 'checked'
    ? CheckedBindingProps
    : UseFieldPropsResult<TValues, TName>['controlProps'];

export type FormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
  TBind extends FormFieldBinding = 'input',
> = UseFieldPropsOptions<TValues, TName> & {
  name: TName;
  label?: ReactNode;
  /** Shows the required marker (validation comes from rules or the schema). */
  required?: boolean;
  description?: ReactNode;
  className?: string;
  /** Optional maximum width; unset fills the available width. */
  width?: FormFieldWidth;
  children: (control: BoundProps<TValues, TName, TBind>, state: UseFieldPropsResult<TValues, TName>) => ReactNode;
} & (TBind extends 'input' ? { bind?: 'input' } : { bind: TBind });

/**
 * A kit `Field` bound to a react-hook-form field: label, control, description and the field's
 * error message, with `aria-invalid` and `aria-describedby` wired by Base UI's Field.
 */
export function FormField<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
>(props: FormFieldProps<TValues, TName, 'value'>): ReactNode;
export function FormField<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
>(props: FormFieldProps<TValues, TName, 'checked'>): ReactNode;
export function FormField<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
>(props: FormFieldProps<TValues, TName>): ReactNode;
export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>(
  props:
    | FormFieldProps<TValues, TName>
    | FormFieldProps<TValues, TName, 'value'>
    | FormFieldProps<TValues, TName, 'checked'>,
) {
  const { name, label, required, description, className, width, control, rules, disabled } = props;
  const enhance = useContext(FieldEnhancerContext);
  const enhanced = enhance?.({ name });
  const fieldDisabled = enhanced?.disabled ?? disabled;
  const state = useFieldProps<TValues, TName>(name, { control, rules, disabled: fieldDisabled });
  const controlProps = enhanced ? { ...state.controlProps, ...enhanced } : state.controlProps;
  const child =
    props.bind === 'value'
      ? props.children(toValueProps(controlProps), state)
      : props.bind === 'checked'
        ? props.children(toCheckedProps(controlProps), state)
        : props.children(controlProps, state);
  return (
    <Field
      {...state.fieldProps}
      disabled={fieldDisabled}
      className={width ? cn('w-full', widths[width], className) : className}
    >
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      {child}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError match={!!state.error}>{state.error}</FieldError>
    </Field>
  );
}

export interface FormProps<TValues extends FieldValues, TTransformed = TValues> extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'onInvalid'
> {
  /** The object returned by `useForm()`. */
  form: UseFormReturn<TValues, unknown, TTransformed>;
  onSubmit: SubmitHandler<TTransformed>;
  onInvalid?: SubmitErrorHandler<TValues>;
  /** Adds form-wide disabled/readOnly props to fields by name. Undefined leaves props unchanged. */
  enhanceFieldProps?: EnhanceFieldProps;
  children?: ReactNode;
}

/**
 * `<form noValidate>` + `FormProvider`: submits through `handleSubmit`, so a failed submit shows
 * every message and focuses the first invalid field (react-hook-form's `shouldFocusError`).
 */
export function Form<TValues extends FieldValues, TTransformed = TValues>({
  form,
  onSubmit,
  onInvalid,
  enhanceFieldProps,
  children,
  ...props
}: FormProps<TValues, TTransformed>) {
  const provider = form as unknown as FormProviderProps<TValues, unknown, TTransformed>;
  return (
    <FormProvider {...provider}>
      <FieldEnhancerContext.Provider value={enhanceFieldProps}>
        <form noValidate {...props} onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          {children}
        </form>
      </FieldEnhancerContext.Provider>
    </FormProvider>
  );
}
