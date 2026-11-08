import { createContext, useContext, useEffect, useRef } from 'react';
import { Button, type ButtonProps } from '../components/Button';
import { useI18n } from '../i18n';

export interface UseFormActionsResult {
  isDirty: boolean;
  isSubmitting: boolean;
  /** Submits through the native form event, including validation and the in-flight guard. */
  submit: () => void;
  /** Restores defaults and clears errors. */
  reset: () => void;
}

export const FormActionsContext = createContext<UseFormActionsResult | null>(null);

/** Form state and actions for controls rendered inside Form. */
export function useFormActions(): UseFormActionsResult {
  const actions = useContext(FormActionsContext);
  if (!actions) throw new Error('useFormActions must be used inside a Form.');
  return actions;
}

export type FormSubmitProps = Omit<ButtonProps, 'type'> & {
  /** Reserve for edit forms; create forms should allow submitting to reveal validation. */
  disableWhenClean?: boolean;
};

/** A kit submit Button bound to the enclosing Form's pending state. */
export function FormSubmit({ children, loading, disabled, disableWhenClean = false, ...props }: FormSubmitProps) {
  const actions = useContext(FormActionsContext);
  const { t } = useI18n();
  const warned = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !actions && !warned.current) {
      warned.current = true;
      console.warn('FormSubmit: use inside Form to bind pending and dirty state. Rendering a plain submit Button.');
    }
  }, [actions]);
  return (
    <>
      <Button
        {...props}
        type="submit"
        loading={loading || actions?.isSubmitting}
        disabled={disabled || (disableWhenClean && actions !== null && !actions.isDirty)}
      >
        {children ?? t('common.save')}
      </Button>
      {actions && (
        <span role="status" aria-live="polite" className="sr-only">
          {actions.isSubmitting ? t('form.submitting') : ''}
        </span>
      )}
    </>
  );
}

export type FormResetProps = Omit<ButtonProps, 'type' | 'variant'>;

/** Discards edits and errors, restoring the enclosing Form's defaults. */
export function FormReset({ children, disabled, onClick, ...props }: FormResetProps) {
  const { reset, isDirty, isSubmitting } = useFormActions();
  const { t } = useI18n();
  return (
    <Button
      {...props}
      type="button"
      variant="ghost"
      disabled={disabled || !isDirty || isSubmitting}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) reset();
      }}
    >
      {children ?? t('actionBar.discard')}
    </Button>
  );
}
