import { useCallback } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import type { FormDialogResult } from '../components/FormDialog';

export interface UseFormDialogResult {
  /** Validates through `form.handleSubmit`; pass it to FormDialog's `onSubmit`. */
  onSubmit: () => Promise<FormDialogResult>;
  /** Resets the form to its default values; pass it to FormDialog's `onClosed`. */
  onClosed: () => void;
}

/**
 * Wires a react-hook-form `form` to a FormDialog: `<FormDialog {...useFormDialog(form, save)}>`.
 * Invalid values return `false` (the dialog stays open and react-hook-form focuses the first invalid
 * field); valid values reach `save` parsed by the resolver, and `save`'s result or rejection drives
 * the dialog. The form is reset to its default values after every close.
 */
export function useFormDialog<TValues extends FieldValues, TTransformed = TValues>(
  form: UseFormReturn<TValues, unknown, TTransformed>,
  save: (values: TTransformed) => FormDialogResult | Promise<FormDialogResult>,
): UseFormDialogResult {
  const { handleSubmit, reset } = form;
  const onSubmit = useCallback(async () => {
    let result: FormDialogResult = false;
    await handleSubmit(async (values) => {
      result = await save(values);
    })();
    return result;
  }, [handleSubmit, save]);
  const onClosed = useCallback(() => reset(), [reset]);
  return { onSubmit, onClosed };
}
