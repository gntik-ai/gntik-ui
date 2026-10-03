import { Alert, Button, Field, FieldError, FieldLabel, PasswordInput, cn } from '@gntik-ai/ui';
import { CircleCheck } from '@gntik-ai/icons';
import { useState, type ReactNode } from 'react';
import { AuthHeader, authFormClass, useAsyncSubmit } from '../shared';

export interface ResetPasswordFormProps {
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
export function ResetPasswordForm({ onSubmit, error: errorProp, minPasswordLength = 8, onContinue, eyebrow = 'Account recovery', className }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const { loading, error, run } = useAsyncSubmit('Your password could not be updated.');
  const alert = errorProp ?? error;
  const tooShort = password.length < minPasswordLength;
  const mismatch = confirm !== password;
  const passwordInvalid = submitted && tooShort;
  const confirmInvalid = (submitted || (confirmTouched && confirm !== '')) && mismatch;

  if (done) {
    return (
      <div className={cn(authFormClass, className)}>
        <span className="mb-5 grid size-11 place-items-center rounded-xl bg-success/14 text-success-text">
          <CircleCheck size={20} aria-hidden />
        </span>
        <AuthHeader eyebrow={eyebrow} title="Password updated" description="You can now sign in with your new password. Other sessions were signed out." />
        <div role="status" className="sr-only">
          Password updated.
        </div>
        <Button size="lg" className="w-full" onClick={onContinue}>
          Continue to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader eyebrow={eyebrow} title="Set a new password" description={`Use at least ${minPasswordLength} characters. Avoid passwords you use elsewhere.`} />
      <form
        noValidate
        aria-label="Set a new password"
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
          <FieldLabel>New password</FieldLabel>
          <PasswordInput showStrength value={password} onValueChange={setPassword} required />
          <FieldError match={passwordInvalid}>Use at least {minPasswordLength} characters.</FieldError>
        </Field>
        <Field invalid={confirmInvalid}>
          <FieldLabel>Confirm password</FieldLabel>
          <PasswordInput autoComplete="new-password" value={confirm} onValueChange={setConfirm} onBlur={() => setConfirmTouched(true)} required />
          <FieldError match={confirmInvalid}>Passwords don't match.</FieldError>
        </Field>
        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Update password
        </Button>
      </form>
    </div>
  );
}
