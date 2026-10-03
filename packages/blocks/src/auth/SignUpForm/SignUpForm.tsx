import { Alert, Button, Checkbox, Field, FieldError, FieldLabel, Input, Link, PasswordInput, cn } from '@gntik-ai/ui';
import { Mail, User } from '@gntik-ai/icons';
import { useId, useState, type MouseEvent, type ReactNode } from 'react';
import { SsoButtons } from '../SsoButtons/SsoButtons';
import { AuthDivider, AuthHeader, EMAIL_RE, authFormClass, useAsyncSubmit } from '../shared';

export interface SignUpValues {
  name: string;
  email: string;
  password: string;
}

export interface SignUpFormProps {
  /** Creates the account. A returned promise shows the loading state; a rejection shows in the alert. */
  onSubmit?: (values: SignUpValues) => void | Promise<void>;
  error?: string | null;
  loading?: boolean;
  /** Minimum password length. */
  minPasswordLength?: number;
  termsHref?: string;
  privacyHref?: string;
  signInHref?: string;
  onSignIn?: () => void;
  /** SSO area under the divider; defaults to SsoButtons, `null` hides it. */
  sso?: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

/** Account creation: name, work email, password with a strength meter and a required terms checkbox. */
export function SignUpForm({
  onSubmit,
  error: errorProp,
  loading: loadingProp,
  minPasswordLength = 8,
  termsHref = '#',
  privacyHref = '#',
  signInHref = '#',
  onSignIn,
  sso = <SsoButtons />,
  eyebrow = 'Get started',
  title = 'Create your account',
  description = 'Set up a workspace for your team in a couple of minutes.',
  className,
}: SignUpFormProps) {
  const termsErrorId = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { loading, error, run } = useAsyncSubmit('The account could not be created.');
  const busy = loadingProp ?? loading;
  const alert = errorProp ?? error;
  const nameInvalid = submitted && name.trim() === '';
  const emailInvalid = submitted && !EMAIL_RE.test(email.trim());
  const passwordInvalid = submitted && password.length < minPasswordLength;
  const termsInvalid = submitted && !terms;

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader eyebrow={eyebrow} title={title} description={description} />
      <form
        noValidate
        aria-label="Create account"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (name.trim() === '' || !EMAIL_RE.test(email.trim()) || password.length < minPasswordLength || !terms) return;
          void run(() => onSubmit?.({ name: name.trim(), email: email.trim(), password }));
        }}
      >
        {alert && <Alert tone="destructive" description={alert} />}
        <Field invalid={nameInvalid}>
          <FieldLabel>Full name</FieldLabel>
          <Input leadingIcon={User} autoComplete="name" placeholder="Avery Collins" value={name} onValueChange={setName} required />
          <FieldError match={nameInvalid}>Enter your name.</FieldError>
        </Field>
        <Field invalid={emailInvalid}>
          <FieldLabel>Work email</FieldLabel>
          <Input type="email" leadingIcon={Mail} autoComplete="email" placeholder="name@company.com" value={email} onValueChange={setEmail} required />
          <FieldError match={emailInvalid}>Enter a valid email address.</FieldError>
        </Field>
        <Field invalid={passwordInvalid}>
          <FieldLabel>Password</FieldLabel>
          <PasswordInput showStrength value={password} onValueChange={setPassword} required />
          <FieldError match={passwordInvalid}>Use at least {minPasswordLength} characters.</FieldError>
        </Field>
        <div>
          <Checkbox
            checked={terms}
            onCheckedChange={setTerms}
            aria-invalid={termsInvalid || undefined}
            aria-describedby={termsInvalid ? termsErrorId : undefined}
            label={
              <>
                I agree to the <Link href={termsHref}>Terms</Link> and <Link href={privacyHref}>Privacy Policy</Link>.
              </>
            }
          />
          {termsInvalid && (
            <p id={termsErrorId} className="mt-1.5 text-[12.5px] text-destructive-text">
              Accept the terms to continue.
            </p>
          )}
        </div>
        <Button type="submit" size="lg" loading={busy} className="mt-2 w-full">
          Create account
        </Button>
      </form>
      {sso != null && (
        <>
          <AuthDivider>Or sign up with</AuthDivider>
          {sso}
        </>
      )}
      <p className="mt-7 text-center text-[13px] text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={signInHref}
          onClick={
            onSignIn
              ? (e: MouseEvent) => {
                  e.preventDefault();
                  onSignIn();
                }
              : undefined
          }
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
