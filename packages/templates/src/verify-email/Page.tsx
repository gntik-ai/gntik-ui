import { AuthHeader } from '@gntik-ai/blocks';
import { Alert, AuthLayout, Button, Link, Stack } from '@gntik-ai/ui';
import { useEffect, useState, type ReactNode } from 'react';
import { verifyEmailSample } from './data';

export interface VerifyEmailPageProps {
  /** Address the verification link was sent to. */
  email: string;
  /** Sends the link again; the button then waits `resendCooldown` seconds. A rejection shows in the alert. */
  onResend: () => void | Promise<void>;
  /** "Use a different email" (back to sign-up). */
  onChangeEmail: () => void;
  resendCooldown: number;
  /** Seconds left before the first resend. Defaults to `resendCooldown` (a link was just sent). */
  initialCooldown: number;
  signInHref: string;
  supportHref: string;
  logo: ReactNode;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Card check-your-inbox step with a resend countdown. */
export default function VerifyEmailPage({
  email = verifyEmailSample.email,
  onResend,
  onChangeEmail,
  resendCooldown = verifyEmailSample.resendCooldown,
  initialCooldown,
  signInHref = verifyEmailSample.signInHref,
  supportHref = verifyEmailSample.supportHref,
  logo,
}: Partial<VerifyEmailPageProps>) {
  // One timestamp for both, so the first render reads exactly the full cooldown.
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const [resendAt, setResendAt] = useState(startedAt + (initialCooldown ?? resendCooldown) * 1000);
  const [sending, setSending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [remaining]);

  const resend = async () => {
    setError(null);
    setSending(true);
    try {
      await onResend?.();
      const t = Date.now();
      setNow(t);
      setResendAt(t + resendCooldown * 1000);
      setResent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The email could not be sent. Try again.');
    }
    setSending(false);
  };

  return (
    <AuthLayout
      fullScreen
      variant="card"
      logo={logo}
      skipLinkLabel="Skip to verification"
      footer={
        <>
          Already verified? <Link href={signInHref}>Sign in</Link>
        </>
      }
    >
      <AuthHeader
        eyebrow="Verify your email"
        title="Check your inbox"
        description={
          <>
            We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Open it on this device to finish setting up your account. The link expires in 24 hours.
          </>
        }
      />
      <Stack gap={4}>
        {error && <Alert tone="destructive" description={error} />}
        <Stack gap={2}>
          <Button variant="secondary" size="lg" className="w-full" loading={sending} disabled={remaining > 0} onClick={() => void resend()}>
            {remaining > 0 ? `Resend email in ${clock(remaining)}` : 'Resend email'}
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={onChangeEmail}>
            Use a different email
          </Button>
        </Stack>
        <Alert
          role="note"
          tone="info"
          description={
            <>
              Can't find it? Check your spam folder, or <Link href={supportHref}>contact support</Link>.
            </>
          }
        />
      </Stack>
      <span role="status" className="sr-only">
        {resent ? `A new verification email was sent to ${email}.` : ''}
      </span>
    </AuthLayout>
  );
}
