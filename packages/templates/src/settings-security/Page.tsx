import { FormSection, SessionsDevices, SettingsRow, type DeviceSession } from '@gntik-ai/blocks';
import { Alert, Badge, Button, Field, FieldDescription, FieldError, FieldLabel, PasswordInput, Stack } from '@gntik-ai/ui';
import { useState, type FormEvent } from 'react';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { DEMO_MFA_CODE, PASSWORD_MIN_LENGTH, mfaSetupKey, sessions as defaultSessions } from './data';
import { MfaSetupDialog } from './MfaSetupDialog';

export interface PasswordChange {
  current: string;
  next: string;
}

export interface SettingsSecurityProps extends SettingsFrameOptions {
  sessions: DeviceSession[];
  /** Whether two-factor authentication is on. */
  mfaEnabled: boolean;
  mfaSetupKey: string;
  /** Checks an enrolment code; defaults to the demo code 123456. */
  onVerifyMfa: (code: string) => boolean | Promise<boolean>;
  onMfaChange: (enabled: boolean) => void;
  /** Changes the password. A rejection shows its message. */
  onPasswordChange: (change: PasswordChange) => void | Promise<void>;
  onRevokeSession: (session: DeviceSession) => void;
  onRevokeOtherSessions: (sessions: DeviceSession[]) => void;
}

/** Security settings: password FormSection, MFA SettingsRow with an OtpInput setup dialog, SessionsDevices. */
export default function SettingsSecurityPage({
  sessions = defaultSessions,
  mfaEnabled = false,
  mfaSetupKey: setupKey = mfaSetupKey,
  onVerifyMfa = (code) => code === DEMO_MFA_CODE,
  onMfaChange,
  onPasswordChange,
  onRevokeSession,
  onRevokeOtherSessions,
  ...frame
}: Partial<SettingsSecurityProps>) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [mfa, setMfa] = useState(mfaEnabled);
  const [setupOpen, setSetupOpen] = useState(false);

  const tooShort = next.length < PASSWORD_MIN_LENGTH;
  const mismatch = confirm !== next;
  const missingCurrent = current.length === 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setResult(null);
    if (tooShort || mismatch || missingCurrent) return;
    setSaving(true);
    try {
      await onPasswordChange?.({ current, next });
      setResult({ ok: true, message: 'Password updated. Other sessions stay signed in.' });
      setCurrent('');
      setNext('');
      setConfirm('');
      setSubmitted(false);
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Could not update the password.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleMfa = (on: boolean) => {
    if (on) {
      setSetupOpen(true);
      return;
    }
    setMfa(false);
    onMfaChange?.(false);
  };

  const verify = async (code: string) => {
    const ok = await onVerifyMfa(code);
    if (ok) {
      setMfa(true);
      onMfaChange?.(true);
    }
    return ok;
  };

  return (
    <SettingsFrame page="security" description="Sign-in methods and the devices signed in to your account." {...frame}>
      <form noValidate onSubmit={(e) => void submit(e)}>
        <FormSection
          title="Password"
          description={`Use at least ${PASSWORD_MIN_LENGTH} characters. Changing it keeps your other sessions signed in.`}
          actions={
            <Button type="submit" loading={saving}>
              Update password
            </Button>
          }
        >
          <Stack gap={4}>
            {result && <Alert tone={result.ok ? 'success' : 'destructive'} title={result.message} role="status" />}
            <Field invalid={submitted && missingCurrent}>
              <FieldLabel>Current password</FieldLabel>
              <PasswordInput value={current} onValueChange={setCurrent} autoComplete="current-password" />
              <FieldError match={submitted && missingCurrent}>Enter your current password.</FieldError>
            </Field>
            <Field invalid={submitted && tooShort}>
              <FieldLabel>New password</FieldLabel>
              <PasswordInput value={next} onValueChange={setNext} showStrength autoComplete="new-password" />
              <FieldError match={submitted && tooShort}>Use at least {PASSWORD_MIN_LENGTH} characters.</FieldError>
            </Field>
            <Field invalid={submitted && mismatch}>
              <FieldLabel>Confirm new password</FieldLabel>
              <PasswordInput value={confirm} onValueChange={setConfirm} autoComplete="new-password" />
              <FieldDescription>Type the new password again.</FieldDescription>
              <FieldError match={submitted && mismatch}>The passwords do not match.</FieldError>
            </Field>
          </Stack>
        </FormSection>
      </form>
      <FormSection title="Two-factor authentication" description="Ask for a one-time code from an authenticator app when you sign in." divided>
        <SettingsRow
          label="Authenticator app"
          description={mfa ? 'Codes from your authenticator app are required at sign-in.' : 'Off. Turning it on opens the setup steps.'}
          checked={mfa}
          onCheckedChange={toggleMfa}
          className="pt-0"
        >
          <Badge size="sm" tone={mfa ? 'success' : 'neutral'} dot className="mt-2">
            {mfa ? 'Enabled' : 'Not set up'}
          </Badge>
        </SettingsRow>
      </FormSection>
      <SessionsDevices sessions={sessions} onRevoke={onRevokeSession} onRevokeOthers={onRevokeOtherSessions} />
      <MfaSetupDialog open={setupOpen} onOpenChange={setSetupOpen} setupKey={setupKey} onVerify={verify} />
    </SettingsFrame>
  );
}
