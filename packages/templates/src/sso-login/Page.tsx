import { AuthHeader } from '@gntik-ai/blocks';
import { Building2 } from '@gntik-ai/icons';
import { Alert, AuthLayout, Button, Field, FieldDescription, FieldError, FieldLabel, Input, Link, Spinner, Stack, Text } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { ssoEmailPattern, ssoLoginSample } from './data';

export interface SsoLoginPageProps {
  /**
   * Looks up the domain's identity provider and starts the redirect. A rejection's message shows
   * in the alert (e.g. "No SSO connection for this domain").
   */
  onSubmit: (email: string) => void | Promise<void>;
  /** Leaves the redirecting state. */
  onCancel: () => void;
  defaultEmail: string;
  /** Name shown while redirecting. */
  providerName: string;
  signInHref: string;
  error: string | null;
  logo: ReactNode;
}

/** Card SSO entry: work email → "Redirecting to your identity provider". */
export default function SsoLoginPage({
  onSubmit,
  onCancel,
  defaultEmail = ssoLoginSample.defaultEmail,
  providerName = ssoLoginSample.providerName,
  signInHref = ssoLoginSample.signInHref,
  error: errorProp = null,
  logo,
}: Partial<SsoLoginPageProps>) {
  const [email, setEmail] = useState(defaultEmail);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalid = submitted && !ssoEmailPattern.test(email.trim());
  const domain = email.trim().split('@')[1] ?? '';
  const alert = errorProp ?? error;

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      await onSubmit?.(email.trim());
      setRedirecting(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Single sign-on could not start. Try again.');
    }
    setLoading(false);
  };

  const footer = (
    <>
      Not using SSO? <Link href={signInHref}>Sign in with a password</Link>
    </>
  );

  return (
    <AuthLayout fullScreen variant="card" logo={logo} skipLinkLabel="Skip to single sign-on" footer={footer}>
      {redirecting ? (
        <Stack gap={6}>
          <AuthHeader
            className="mb-0"
            eyebrow="Single sign-on"
            title={`Redirecting to ${providerName}`}
            description={
              <>
                <span className="font-medium text-foreground">{domain}</span> signs in through {providerName}. If nothing happens in a few seconds, try again.
              </>
            }
          />
          <Stack direction="row" align="center" gap={3} role="status">
            <Spinner size={18} />
            <Text variant="supporting" tone="muted">
              Waiting for {providerName}…
            </Text>
          </Stack>
          <Stack gap={2}>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => void start()} loading={loading}>
              Try again
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => {
                setRedirecting(false);
                onCancel?.();
              }}
            >
              Use a different email
            </Button>
          </Stack>
        </Stack>
      ) : (
        <>
          <AuthHeader eyebrow="Single sign-on" title="Sign in with SSO" description="Enter your work email and we'll send you to your organization's identity provider." />
          <form
            noValidate
            aria-label="Single sign-on"
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              if (ssoEmailPattern.test(email.trim())) void start();
            }}
          >
            {alert && <Alert tone="destructive" description={alert} />}
            <Field invalid={invalid}>
              <FieldLabel>Work email</FieldLabel>
              <Input type="email" leadingIcon={Building2} autoComplete="email" placeholder="name@company.com" value={email} onValueChange={setEmail} required />
              <FieldDescription>Your domain decides where you sign in.</FieldDescription>
              <FieldError match={invalid}>Enter a valid work email.</FieldError>
            </Field>
            <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
              Continue with SSO
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
