import {
  useController,
  useFormContext,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form';

export interface UseFieldPropsOptions<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  /** The form's `control`. Defaults to the nearest `<FormProvider>` / `<Form>`. */
  control?: Control<TValues>;
  /** Field-level rules (`required`, `minLength`, `validate`…). Prefer a schema resolver for whole forms. */
  rules?: Omit<RegisterOptions<TValues, TName>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  /** Disables the control (and skips its validation). */
  disabled?: boolean;
}

/** Props for the kit's `<Field>`: drive its invalid / touched / dirty state from react-hook-form. */
export interface FormFieldStateProps {
  name: string;
  invalid: boolean;
  touched: boolean;
  dirty: boolean;
}

export interface UseFieldPropsResult<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  /** Spread on `<Field>`. Base UI then links the label, description and error to the control. */
  fieldProps: FormFieldStateProps;
  /**
   * Spread on the control (`<Input {...controlProps} />`), or map it (`value` + `onValueChange={controlProps.onChange}`).
   * `ref` must reach a focusable element so a failed submit can focus the first invalid field.
   */
  controlProps: ControllerRenderProps<TValues, TName> & { 'aria-invalid'?: true };
  /** The current error message, for `<FieldError match={!!error}>{error}</FieldError>`. */
  error: string | undefined;
  fieldState: ControllerFieldState;
}

/**
 * Wires one react-hook-form field (through `useController`) into the kit's Field parts.
 * Works with uncontrolled-looking inputs too: `Input` gets `value` / `onChange` / `onBlur` / `ref`.
 */
export function useFieldProps<TValues extends FieldValues = FieldValues, TName extends FieldPath<TValues> = FieldPath<TValues>>(
  name: TName,
  { control, rules, disabled }: UseFieldPropsOptions<TValues, TName> = {},
): UseFieldPropsResult<TValues, TName> {
  const context = useFormContext<TValues>();
  const { field, fieldState } = useController<TValues, TName>({ name, control: control ?? context?.control, rules, disabled });
  const invalid = !!fieldState.error;
  return {
    fieldProps: { name, invalid, touched: fieldState.isTouched, dirty: fieldState.isDirty },
    controlProps: { ...field, 'aria-invalid': invalid || undefined },
    error: errorMessage(fieldState.error),
    fieldState,
  };
}

/** First message of a field error (also for array / object errors that carry `root`). */
function errorMessage(error: ControllerFieldState['error']): string | undefined {
  if (!error) return undefined;
  if (typeof error.message === 'string' && error.message) return error.message;
  const root = (error as { root?: { message?: unknown } }).root;
  return typeof root?.message === 'string' ? root.message : undefined;
}
