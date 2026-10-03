import { Alert, Button, Field, FieldDescription, FieldError, FieldLabel, Input, OtpInput, cn } from '@gntik-ai/ui';
import { useEffect, useState, type ReactNode } from 'react';
import { AuthHeader, authFormClass, useAsyncSubmit } from '../shared';

export type MfaMethod = 'code' | 'backup';

export interface MfaChallengeProps {
  /** Verifies the code. A returned promise shows the loading state; a rejection shows in the alert. */
  onVerify?: (code: string, method: MfaMethod) => void | Promise<void>;
  /** Sends a new code; the resend button then waits `resendCooldown` seconds. */
  onResend?: () => void | Promise<void>;
  /** Seconds between resends. */
  resendCooldown?: number;
  /** Seconds left before the first resend (a code was just sent). Defaults to `resendCooldown`. */
  initialCooldown?: number;
  /** Code length. */
  length?: 6 | 8;
  /** Where the code was sent, e.g. "a•••@example.com". Omit for authenticator apps. */
  destination?: string;
  error?: string | null;
  loading?: boolean;
  /** Called when the user gives up ("Back to sign in"). */
  onCancel?: () => void;
  eyebrow?: ReactNode;
  title?: ReactNode;
  className?: string;
}

/**
 * Second-factor step: a one-time code (auto-submits when complete), a switch to a backup code,
 * and a resend button with a countdown.
 */
export function MfaChallenge({
  onVerify,
  onResend,
  resendCooldown = 30,
  initialCooldown,
  length = 6,
  destination,
  error: errorProp,
  loading: loadingProp,
  onCancel,
  eyebrow = 'Two-step verification',
  title = 'Enter your verification code',
  className,
}: MfaChallengeProps) {
  const [method, setMethod] = useState<MfaMethod>('code');
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState('');
  const [submitted, setSubmitted] = useState(false);
  // One start time for both, so the first render shows the full cooldown (not cooldown + 1s).
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(start);
  const [resendAt, setResendAt] = useState(() => start + (initialCooldown ?? resendCooldown) * 1000);
  const [resent, setResent] = useState(false);
  const { loading, error, run } = useAsyncSubmit('That code did not work. Try again.');
  const busy = loadingProp ?? loading;
  const alert = errorProp ?? error;
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const value = method === 'code' ? code : backup.trim();
  const invalid = submitted && (method === 'code' ? code.length < length : backup.trim() === '');

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [remaining]);

  const verify = (v: string) => {
    setSubmitted(true);
    if (method === 'code' ? v.length < length : v === '') return;
    void run(() => onVerify?.(v, method));
  };

  const resend = async () => {
    const t = Date.now();
    setNow(t);
    setResendAt(t + resendCooldown * 1000);
    setResent(true);
    await onResend?.();
  };

  const description =
    method === 'backup'
      ? 'Enter one of the backup codes you saved when you turned on two-step verification. Each code works once.'
      : destination
        ? `We sent a ${length}-digit code to ${destination}.`
        : `Open your authenticator app and enter the ${length}-digit code.`;

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader eyebrow={eyebrow} title={method === 'backup' ? 'Use a backup code' : title} description={description} />
      <form
        noValidate
        aria-label="Verify your identity"
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          verify(value);
        }}
      >
        {alert && <Alert tone="destructive" description={alert} />}
        {method === 'code' ? (
          <Field invalid={invalid}>
            <FieldLabel>Verification code</FieldLabel>
            <OtpInput length={length} value={code} onValueChange={setCode} onComplete={verify} invalid={invalid} groupSize={length / 2} disabled={busy} />
            <FieldError match={invalid}>Enter all {length} digits.</FieldError>
          </Field>
        ) : (
          <Field invalid={invalid}>
            <FieldLabel>Backup code</FieldLabel>
            <Input value={backup} onValueChange={setBackup} placeholder="xxxx-xxxx" autoComplete="one-time-code" spellCheck={false} inputClassName="font-mono tracking-wider" />
            <FieldDescription>Backup codes are 8 characters, with or without the dash.</FieldDescription>
            <FieldError match={invalid}>Enter a backup code.</FieldError>
          </Field>
        )}
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Verify
        </Button>
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={method === 'backup'}
          onClick={() => {
            setMethod(method === 'code' ? 'backup' : 'code');
            setSubmitted(false);
          }}
        >
          {method === 'code' ? 'Use a backup code' : 'Use a verification code'}
        </Button>
        {method === 'code' && onResend !== undefined && (
          <Button variant="ghost" size="sm" disabled={remaining > 0} onClick={() => void resend()}>
            {remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code'}
          </Button>
        )}
      </div>
      <span role="status" className="sr-only">
        {resent ? 'A new code was sent.' : ''}
      </span>
      {onCancel && (
        <p className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Back to sign in
          </Button>
        </p>
      )}
    </div>
  );
}
