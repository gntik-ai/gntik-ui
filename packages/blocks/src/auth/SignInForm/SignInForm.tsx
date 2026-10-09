import { Alert, Button, Checkbox, Field, FieldDescription, FieldError, FieldLabel, Input, Link, PasswordInput, cn } from '@gntik-ai/ui';
import { Lock, Mail } from '@gntik-ai/icons';
import { useImperativeHandle, useRef, useState, type MouseEvent, type ReactNode, type Ref } from 'react';
import { SsoButtons } from '../SsoButtons/SsoButtons';
import {
  AuthDivider,
  AuthHeader,
  authIdentifierError,
  authFormClass,
  useAsyncSubmit,
  type AuthIdentifierConfig,
  type AuthValidationMessages,
  type AuthFormAccessibilityProps,
  type AuthHeaderProps,
} from '../shared';

export interface SignInValues {
  email: string;
  /** Trimmed identifier in text mode. `email` remains available for existing consumers. */
  identifier?: string;
  password: string;
  remember: boolean;
}

export interface SignInFormRef {
  focus(field: 'identifier' | 'password'): void;
}

export interface SignInFormProps extends AuthFormAccessibilityProps {
  /** React 19 ref for focus after a server response. */
  ref?: Ref<SignInFormRef>;
  identifier?: AuthIdentifierConfig;
  /** The kit validates before submit. Supply copy here; do not add a second inline validator. */
  messages?: AuthValidationMessages;
  passwordHelp?: ReactNode;
  passwordHelpId?: string;
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
  /** Replaces the sign-up prompt; `null` hides it. Defaults to the existing account link. */
  signUpPrompt?: ReactNode;
  /** SSO area under the divider; defaults to SsoButtons, `null` hides it. */
  sso?: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Omit the internal heading with null; the form keeps its accessible name. */
  headingLevel?: AuthHeaderProps['headingLevel'];
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
  identifier,
  messages,
  passwordHelp,
  passwordHelpId,
  ref,
  fieldInvalid,
  feedbackId,
  'aria-describedby': describedBy,
  'aria-label': ariaLabel = 'Sign in',
  'aria-labelledby': labelledBy,
  onSubmit,
  error: errorProp,
  loading: loadingProp,
  defaultEmail = '',
  forgotPasswordHref = '#',
  onForgotPassword,
  signUpHref = '#',
  onSignUp,
  signUpPrompt,
  sso = <SsoButtons />,
  eyebrow = 'Secure access',
  title = 'Sign in to your workspace',
  description = 'Use your work email to continue.',
  headingLevel,
  className,
}: SignInFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const { loading, error, run } = useAsyncSubmit('Sign-in failed. Try again.');
  const busy = loadingProp ?? loading;
  const alert = errorProp ?? error;
  const identifierInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      focus: (field) => (field === 'password' ? passwordInput : identifierInput).current?.focus(),
    }),
    [],
  );
  const identifierError = authIdentifierError(email, identifier, messages);
  const emailInvalid = submitted && identifierError !== null;
  const passwordInvalid = submitted && password === '';

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader eyebrow={eyebrow} title={title} description={description} headingLevel={headingLevel} />
      <form
        noValidate
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (identifierError !== null) {
            identifierInput.current?.focus();
            return;
          }
          if (password === '') {
            passwordInput.current?.focus();
            return;
          }
          void run(() => onSubmit?.({ email: email.trim(), ...(identifier?.type === 'text' ? { identifier: email.trim() } : {}), password, remember }));
        }}
      >
        {alert && <Alert id={feedbackId} tone="destructive" description={alert} />}
        <Field invalid={emailInvalid || fieldInvalid?.identifier === true}>
          <FieldLabel>{identifier?.label ?? 'Email'}</FieldLabel>
          <Input
            ref={identifierInput}
            aria-describedby={fieldInvalid?.identifier ? feedbackId : undefined}
            type={identifier?.type ?? 'email'}
            leadingIcon={Mail}
            autoComplete={identifier?.autoComplete ?? 'email'}
            placeholder={identifier?.placeholder ?? 'name@company.com'}
            minLength={identifier?.minLength}
            maxLength={identifier?.maxLength}
            value={email}
            onValueChange={setEmail}
            required
          />
          {identifier?.help != null && <FieldDescription id={identifier.helpId}>{identifier.help}</FieldDescription>}
          <FieldError role="alert" match={emailInvalid}>
            {identifierError}
          </FieldError>
        </Field>
        <Field invalid={passwordInvalid || fieldInvalid?.password === true}>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Password</FieldLabel>
            <Link href={forgotPasswordHref} onClick={linkHandler(onForgotPassword)} className="text-[12.5px]">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            ref={passwordInput}
            aria-describedby={fieldInvalid?.password ? feedbackId : undefined}
            leadingIcon={Lock}
            value={password}
            onValueChange={setPassword}
            required
          />
          {passwordHelp != null && <FieldDescription id={passwordHelpId}>{passwordHelp}</FieldDescription>}
          <FieldError role="alert" match={passwordInvalid}>
            {messages?.passwordRequired ?? 'Enter your password.'}
          </FieldError>
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
      {signUpPrompt !== null && (
        <p className="mt-7 text-center text-[13px] text-muted-foreground">
          {signUpPrompt === undefined ? (
            <>
              New here?{' '}
              <Link href={signUpHref} onClick={linkHandler(onSignUp)}>
                Create an account
              </Link>
            </>
          ) : (
            signUpPrompt
          )}
        </p>
      )}
    </div>
  );
}
