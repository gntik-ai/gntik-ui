import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import type {
  FieldPath,
  FieldPathValue,
  FieldValues,
  FormProviderProps,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReset,
  UseFormReturn,
} from 'react-hook-form';
import { FormProvider, useFormState } from 'react-hook-form';
import { FormActionsContext } from './FormActions';
import { cn } from '../utils/cn';
import { toValueProps, toCheckedProps, type ValueBindingProps, type CheckedBindingProps } from './bindings';
import { Field, FieldDescription, FieldError, FieldLabel } from '../components/Field';
import { createServerErrorStore, ServerErrorsContext, type FormServerErrors } from './serverErrors';
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
  /** After a successful save: keep state (default), rebase raw inputs, or restore defaults. */
  afterSubmit?: 'keep' | 'rebase' | 'reset';
  /** Adds form-wide disabled/readOnly props to fields by name. Undefined leaves props unchanged. */
  enhanceFieldProps?: EnhanceFieldProps;
  /**
   * Server-side messages by field path (`name`, `members.1.email`); `''` or a path with no mounted
   * FormField goes to FormRootError. Applied when the object's identity changes, so keep it in state.
   * Each message clears on the first edit of its field, and on submit or reset.
   */
  errors?: FormServerErrors;
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
  afterSubmit = 'keep',
  enhanceFieldProps,
  errors,
  children,
  ...props
}: FormProps<TValues, TTransformed>) {
  const { isDirty, isSubmitting } = useFormState({ control: form.control });
  const formElement = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);
  const serverErrors = useServerErrors(form, errors, formElement);
  const reset = serverErrors.reset;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    serverErrors.store.reset();
    try {
      await form.handleSubmit(async (values, event) => {
        await onSubmit(values, event);
        if (afterSubmit === 'rebase') reset(form.getValues());
        else if (afterSubmit === 'reset') reset();
      }, onInvalid)(event);
    } finally {
      inFlight.current = false;
    }
  };
  const provider = { ...form, reset } as unknown as FormProviderProps<TValues, unknown, TTransformed>;
  return (
    <FormProvider {...provider}>
      <ServerErrorsContext.Provider value={serverErrors.store}>
        <FieldEnhancerContext.Provider value={enhanceFieldProps}>
          <FormActionsContext.Provider
            value={{
              isDirty,
              isSubmitting,
              submit: () => {
                const element = formElement.current;
                if (!element) return;
                if (typeof element.requestSubmit === 'function') element.requestSubmit();
                else element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              },
              reset: () => reset(),
            }}
          >
            <form noValidate {...props} ref={formElement} onSubmit={submit}>
              {children}
            </form>
          </FormActionsContext.Provider>
        </FieldEnhancerContext.Provider>
      </ServerErrorsContext.Provider>
    </FormProvider>
  );
}

/**
 * The Form's server-error store and its one reset function. Submit and every reset path (FormReset,
 * afterSubmit, and a consumer's `form.reset()` while the Form is mounted) clear the store through it.
 */
function useServerErrors<TValues extends FieldValues, TTransformed>(
  form: UseFormReturn<TValues, unknown, TTransformed>,
  errors: FormServerErrors | undefined,
  formElement: RefObject<HTMLFormElement | null>,
) {
  const [store] = useState(createServerErrorStore);
  const original = useMemo(() => form.reset, [form]);
  const reset = useCallback<UseFormReset<TValues>>(
    (...args) => {
      store.reset();
      return original(...args);
    },
    [store, original],
  );
  useEffect(() => interceptReset(form, reset, original), [form, reset, original]);
  const applied = useRef<FormServerErrors>(undefined);
  useEffect(() => {
    if (errors && errors !== applied.current) store.apply(errors);
    applied.current = errors;
  }, [store, errors]);
  // Focus after the applied errors have committed, so the control's description already holds them.
  const focusTicket = useSyncExternalStore(store.subscribe, store.getFocusTicket, () => 0);
  useEffect(() => {
    if (focusTicket > 0) store.focusFirst(formElement.current);
  }, [store, focusTicket, formElement]);
  return { store, reset };
}

/** Routes a consumer's `form.reset()` through the Form's reset while mounted; the cleanup restores the original. */
function interceptReset<TValues extends FieldValues>(
  form: { reset: UseFormReset<TValues> },
  reset: UseFormReset<TValues>,
  original: UseFormReset<TValues>,
): () => void {
  form.reset = reset;
  return () => {
    if (form.reset === reset) form.reset = original;
  };
}
