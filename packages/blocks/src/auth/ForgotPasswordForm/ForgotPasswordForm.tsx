import { Alert, Button, Field, FieldError, FieldLabel, Input, Link, cn } from '@gntik-ai/ui';
import { ArrowLeft, Mail, MailCheck } from '@gntik-ai/icons';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { AuthHeader, EMAIL_RE, authFormClass, useAsyncSubmit } from '../shared';

export interface ForgotPasswordFormProps {
  /** Requests the reset link. A returned promise shows the loading state; a rejection shows in the alert. */
  onSubmit?: (email: string) => void | Promise<void>;
  error?: string | null;
  defaultEmail?: string;
  /** Start on the "sent" step (e.g. after a redirect). */
  defaultSent?: boolean;
  signInHref?: string;
  onBackToSignIn?: () => void;
  eyebrow?: ReactNode;
  className?: string;
}

/** Request a reset link by email, then a "check your inbox" state with resend and a way back. */
export function ForgotPasswordForm({
  onSubmit,
  error: errorProp,
  defaultEmail = '',
  defaultSent = false,
  signInHref = '#',
  onBackToSignIn,
  eyebrow = 'Account recovery',
  className,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(defaultSent);
  const { loading, error, run } = useAsyncSubmit('The reset link could not be sent.');
  const alert = errorProp ?? error;
  const emailInvalid = submitted && !EMAIL_RE.test(email.trim());

  const send = async () => {
    const ok = await run(() => onSubmit?.(email.trim()));
    if (ok) setSent(true);
  };

  const back = (
    <Link
      href={signInHref}
      tone="muted"
      className="inline-flex items-center gap-1.5 text-[13px]"
      onClick={
        onBackToSignIn
          ? (e: MouseEvent) => {
              e.preventDefault();
              onBackToSignIn();
            }
          : undefined
      }
    >
      <ArrowLeft size={14} aria-hidden className="rtl:-scale-x-100" />
      Back to sign in
    </Link>
  );

  if (sent) {
    return (
      <div className={cn(authFormClass, className)}>
        <span className="mb-5 grid size-11 place-items-center rounded-xl bg-primary/14 text-primary-chip-text">
          <MailCheck size={20} aria-hidden />
        </span>
        <AuthHeader
          eyebrow={eyebrow}
          title="Check your email"
          description={
            <>
              If an account exists for <span className="font-medium text-foreground">{email.trim() || 'that address'}</span>, you will receive a link to reset your password. It expires in 1 hour.
            </>
          }
        />
        <div role="status" className="sr-only">
          Reset link sent.
        </div>
        {alert && <Alert tone="destructive" description={alert} className="mb-4" />}
        <div className="flex flex-col gap-2.5">
          <Button variant="secondary" size="lg" loading={loading} className="w-full" onClick={() => void send()}>
            Resend link
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => {
              setSent(false);
              setSubmitted(false);
            }}
          >
            Use a different email
          </Button>
        </div>
        <p className="mt-7 text-center">{back}</p>
      </div>
    );
  }

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader eyebrow={eyebrow} title="Forgot your password?" description="Enter the email you sign in with and we'll send you a reset link." />
      <form
        noValidate
        aria-label="Reset password request"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (EMAIL_RE.test(email.trim())) void send();
        }}
      >
        {alert && <Alert tone="destructive" description={alert} />}
        <Field invalid={emailInvalid}>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" leadingIcon={Mail} autoComplete="email" placeholder="name@company.com" value={email} onValueChange={setEmail} required />
          <FieldError match={emailInvalid}>Enter a valid email address.</FieldError>
        </Field>
        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Send reset link
        </Button>
      </form>
      <p className="mt-7 text-center">{back}</p>
    </div>
  );
}
