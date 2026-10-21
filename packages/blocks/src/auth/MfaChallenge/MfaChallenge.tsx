import {
  useI18n,
  Alert,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  OtpInput,
  cn,
} from '@gntik-ai/ui';
import { useEffect, useState, type ReactNode } from 'react';
import { AuthHeader, authFormClass, useAsyncSubmit } from '../shared';

export type MfaMethod = 'code' | 'backup';

export interface MfaChallengeLabels {
  eyebrow: string;
  title: string;
  backupTitle: string;
  backupDescription: string;
  destinationDescription: (length: number, destination: string) => string;
  description: (length: number) => string;
  formLabel: string;
  codeLabel: string;
  codeRequired: (length: number) => string;
  backupLabel: string;
  backupPlaceholder: string;
  backupHint: string;
  backupRequired: string;
  submit: string;
  useCode: string;
  resendIn: (remaining: number) => string;
  resend: string;
  resent: string;
  backToSignIn: string;
  fallbackError: string;
}

export interface MfaChallengeProps {
  labels?: Partial<MfaChallengeLabels>;
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
  labels,
  onVerify,
  onResend,
  resendCooldown = 30,
  initialCooldown,
  length = 6,
  destination,
  error: errorProp,
  loading: loadingProp,
  onCancel,
  eyebrow: eyebrowProp,
  title: titleProp,
  className,
}: MfaChallengeProps) {
  const { t } = useI18n();
  const eyebrow = eyebrowProp === undefined ? (labels?.eyebrow ?? t('mfaChallenge.eyebrow')) : eyebrowProp;
  const title = titleProp === undefined ? (labels?.title ?? t('mfaChallenge.title')) : titleProp;
  const [method, setMethod] = useState<MfaMethod>('code');
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState('');
  const [submitted, setSubmitted] = useState(false);
  // One start time for both, so the first render shows the full cooldown (not cooldown + 1s).
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(start);
  const [resendAt, setResendAt] = useState(() => start + (initialCooldown ?? resendCooldown) * 1000);
  const [resent, setResent] = useState(false);
  const { loading, error, run } = useAsyncSubmit(labels?.fallbackError ?? t('mfaChallenge.fallbackError'));
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
    const time = Date.now();
    setNow(time);
    setResendAt(time + resendCooldown * 1000);
    setResent(true);
    await onResend?.();
  };

  const description =
    method === 'backup'
      ? (labels?.backupDescription ?? t('mfaChallenge.backupDescription'))
      : destination
        ? (labels?.destinationDescription?.(length, destination) ??
          t('mfaChallenge.destinationDescription', { length, destination }))
        : (labels?.description?.(length) ?? t('mfaChallenge.description', { length }));

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader
        eyebrow={eyebrow}
        title={method === 'backup' ? (labels?.backupTitle ?? t('mfaChallenge.backupTitle')) : title}
        description={description}
      />
      <form
        noValidate
        aria-label={labels?.formLabel ?? t('mfaChallenge.formLabel')}
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          verify(value);
        }}
      >
        {alert && <Alert tone="destructive" description={alert} />}
        {method === 'code' ? (
          <Field invalid={invalid}>
            <FieldLabel>{labels?.codeLabel ?? t('mfaChallenge.codeLabel')}</FieldLabel>
            <OtpInput
              length={length}
              value={code}
              onValueChange={setCode}
              onComplete={verify}
              invalid={invalid}
              groupSize={length / 2}
              disabled={busy}
            />
            <FieldError match={invalid}>
              {labels?.codeRequired?.(length) ?? t('mfaChallenge.codeRequired', { length })}
            </FieldError>
          </Field>
        ) : (
          <Field invalid={invalid}>
            <FieldLabel>{labels?.backupLabel ?? t('mfaChallenge.backupLabel')}</FieldLabel>
            <Input
              value={backup}
              onValueChange={setBackup}
              placeholder={labels?.backupPlaceholder ?? t('mfaChallenge.backupPlaceholder')}
              autoComplete="one-time-code"
              spellCheck={false}
              inputClassName="font-mono tracking-wider"
            />
            <FieldDescription>{labels?.backupHint ?? t('mfaChallenge.backupHint')}</FieldDescription>
            <FieldError match={invalid}>{labels?.backupRequired ?? t('mfaChallenge.backupRequired')}</FieldError>
          </Field>
        )}
        <Button type="submit" size="lg" loading={busy} className="w-full">
          {labels?.submit ?? t('mfaChallenge.submit')}
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
          {method === 'code'
            ? (labels?.backupTitle ?? t('mfaChallenge.backupTitle'))
            : (labels?.useCode ?? t('mfaChallenge.useCode'))}
        </Button>
        {method === 'code' && onResend !== undefined && (
          <Button variant="ghost" size="sm" disabled={remaining > 0} onClick={() => void resend()}>
            {remaining > 0
              ? (labels?.resendIn?.(remaining) ?? t('mfaChallenge.resendIn', { remaining }))
              : (labels?.resend ?? t('mfaChallenge.resend'))}
          </Button>
        )}
      </div>
      <span role="status" className="sr-only">
        {resent ? (labels?.resent ?? t('mfaChallenge.resent')) : ''}
      </span>
      {onCancel && (
        <p className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {labels?.backToSignIn ?? t('mfaChallenge.backToSignIn')}
          </Button>
        </p>
      )}
    </div>
  );
}
