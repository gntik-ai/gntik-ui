import { useI18n, Alert, Button, Field, FieldError, FieldLabel, PasswordInput, cn } from '@gntik-ai/ui';
import { CircleCheck } from '@gntik-ai/icons';
import { useState, type ReactNode } from 'react';
import { AuthHeader, authFormClass, useAsyncSubmit } from '../shared';

export interface ResetPasswordFormLabels {
  eyebrow: string;
  title: string;
  description: (minimum: number) => string;
  newPassword: string;
  confirmPassword: string;
  passwordTooShort: (minimum: number) => string;
  passwordMismatch: string;
  submit: string;
  successTitle: string;
  successDescription: string;
  successStatus: string;
  continue: string;
  fallbackError: string;
}

export interface ResetPasswordFormProps {
  labels?: Partial<ResetPasswordFormLabels>;
  /** Saves the new password. A returned promise shows the loading state; a rejection shows in the alert. */
  onSubmit?: (password: string) => void | Promise<void>;
  error?: string | null;
  minPasswordLength?: number;
  /** Called from the success state ("Continue to sign in"). */
  onContinue?: () => void;
  eyebrow?: ReactNode;
  className?: string;
}

/** New password + confirmation with length and mismatch validation, then a success state. */
export function ResetPasswordForm({
  labels,
  onSubmit,
  error: errorProp,
  minPasswordLength = 8,
  onContinue,
  eyebrow: eyebrowProp,
  className,
}: ResetPasswordFormProps) {
  const { t } = useI18n();
  const eyebrow = eyebrowProp === undefined ? (labels?.eyebrow ?? t('resetPassword.eyebrow')) : eyebrowProp;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const { loading, error, run } = useAsyncSubmit(labels?.fallbackError ?? t('resetPassword.fallbackError'));
  const alert = errorProp ?? error;
  const tooShort = password.length < minPasswordLength;
  const mismatch = confirm !== password;
  const passwordInvalid = submitted && tooShort;
  const confirmInvalid = (submitted || (confirmTouched && confirm !== '')) && mismatch;

  if (done) {
    return (
      <div className={cn(authFormClass, className)}>
        <span className="mb-5 grid size-11 place-items-center rounded-xl bg-success/14 text-success-chip-text">
          <CircleCheck size={20} aria-hidden />
        </span>
        <AuthHeader
          eyebrow={eyebrow}
          title={labels?.successTitle ?? t('resetPassword.successTitle')}
          description={labels?.successDescription ?? t('resetPassword.successDescription')}
        />
        <div role="status" className="sr-only">
          {labels?.successStatus ?? t('resetPassword.successStatus')}
        </div>
        <Button size="lg" className="w-full" onClick={onContinue}>
          {labels?.continue ?? t('resetPassword.continue')}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader
        eyebrow={eyebrow}
        title={labels?.title ?? t('resetPassword.title')}
        description={
          labels?.description?.(minPasswordLength) ?? t('resetPassword.description', { minimum: minPasswordLength })
        }
      />
      <form
        noValidate
        aria-label={labels?.title ?? t('resetPassword.title')}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (tooShort || mismatch) return;
          void run(() => onSubmit?.(password)).then((ok) => ok && setDone(true));
        }}
      >
        {alert && <Alert tone="destructive" description={alert} />}
        <Field invalid={passwordInvalid}>
          <FieldLabel>{labels?.newPassword ?? t('resetPassword.newPassword')}</FieldLabel>
          <PasswordInput showStrength value={password} onValueChange={setPassword} required />
          <FieldError match={passwordInvalid}>
            {labels?.passwordTooShort?.(minPasswordLength) ??
              t('resetPassword.passwordTooShort', { minimum: minPasswordLength })}
          </FieldError>
        </Field>
        <Field invalid={confirmInvalid}>
          <FieldLabel>{labels?.confirmPassword ?? t('resetPassword.confirmPassword')}</FieldLabel>
          <PasswordInput
            autoComplete="new-password"
            value={confirm}
            onValueChange={setConfirm}
            onBlur={() => setConfirmTouched(true)}
            required
          />
          <FieldError match={confirmInvalid}>
            {labels?.passwordMismatch ?? t('resetPassword.passwordMismatch')}
          </FieldError>
        </Field>
        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          {labels?.submit ?? t('resetPassword.submit')}
        </Button>
      </form>
    </div>
  );
}
