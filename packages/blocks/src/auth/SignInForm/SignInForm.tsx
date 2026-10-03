import { Alert, Button, Checkbox, Field, FieldError, FieldLabel, Input, Link, PasswordInput, cn } from '@gntik-ai/ui';
import { Lock, Mail } from '@gntik-ai/icons';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { SsoButtons } from '../SsoButtons/SsoButtons';
import { AuthDivider, AuthHeader, EMAIL_RE, authFormClass, useAsyncSubmit } from '../shared';

export interface SignInValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignInFormProps {
  /** Signs in. A returned promise shows the loading state; a rejection's message shows in the alert. */
  onSubmit?: (values: SignInValues) => void | Promise<void>;
  /** Error from the server (e.g. "Incorrect email or password"). */
  error?: string | null;
  /** Forces the loading state (when the parent tracks the request). */
  loading?: boolean;
  defaultEmail?: string;
  forgotPasswordHref?: string;
  onForgotPassword?: () => void;
  signUpHref?: string;
  onSignUp?: () => void;
  /** SSO area under the divider; defaults to SsoButtons, `null` hides it. */
  sso?: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

const linkHandler = (fn?: () => void) =>
  fn
    ? (e: MouseEvent) => {
        e.preventDefault();
        fn();
      }
    : undefined;

/** Email + password sign-in with remember me, forgot-password link, SSO slot, error alert and loading. */
export function SignInForm({
  onSubmit,
  error: errorProp,
  loading: loadingProp,
  defaultEmail = '',
  forgotPasswordHref = '#',
  onForgotPassword,
  signUpHref = '#',
  onSignUp,
  sso = <SsoButtons />,
  eyebrow = 'Secure access',
  title = 'Sign in to your workspace',
  description = 'Use your work email to continue.',
  className,
}: SignInFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const { loading, error, run } = useAsyncSubmit('Sign-in failed. Try again.');
  const busy = loadingProp ?? loading;
  const alert = errorProp ?? error;
  const emailInvalid = submitted && !EMAIL_RE.test(email.trim());
  const passwordInvalid = submitted && password === '';

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader eyebrow={eyebrow} title={title} description={description} />
      <form
        noValidate
        aria-label="Sign in"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (!EMAIL_RE.test(email.trim()) || password === '') return;
          void run(() => onSubmit?.({ email: email.trim(), password, remember }));
        }}
      >
        {alert && <Alert tone="destructive" description={alert} />}
        <Field invalid={emailInvalid}>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" leadingIcon={Mail} autoComplete="email" placeholder="name@company.com" value={email} onValueChange={setEmail} required />
          <FieldError match={emailInvalid}>Enter a valid email address.</FieldError>
        </Field>
        <Field invalid={passwordInvalid}>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Password</FieldLabel>
            <Link href={forgotPasswordHref} onClick={linkHandler(onForgotPassword)} className="text-[12.5px]">
              Forgot password?
            </Link>
          </div>
          <PasswordInput leadingIcon={Lock} value={password} onValueChange={setPassword} required />
          <FieldError match={passwordInvalid}>Enter your password.</FieldError>
        </Field>
        <Checkbox label="Keep me signed in" checked={remember} onCheckedChange={setRemember} />
        <Button type="submit" size="lg" loading={busy} className="mt-2 w-full">
          Sign in
        </Button>
      </form>
      {sso != null && (
        <>
          <AuthDivider>Or continue with</AuthDivider>
          {sso}
        </>
      )}
      <p className="mt-7 text-center text-[13px] text-muted-foreground">
        New here?{' '}
        <Link href={signUpHref} onClick={linkHandler(onSignUp)}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
