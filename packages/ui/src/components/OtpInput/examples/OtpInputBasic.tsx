import { useState } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../Field';
import { OtpInput } from '../OtpInput';

/** Verification flow: "123456" is the valid demo code. */
export default function OtpInputBasic() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  return (
    <div className="flex flex-col gap-8">
      <Field invalid={status === 'error'}>
        <FieldLabel>Verification code</FieldLabel>
        <OtpInput
          groupSize={3}
          onValueChange={() => setStatus('idle')}
          onComplete={(code) => setStatus(code === '123456' ? 'ok' : 'error')}
        />
        {status === 'ok' ? (
          <p role="status" className="text-[12px] text-success-text">Code verified. Your device is trusted.</p>
        ) : (
          <FieldDescription>Enter the 6-digit code we sent to your authenticator app.</FieldDescription>
        )}
        <FieldError match={status === 'error'}>That code is not valid. Try again.</FieldError>
      </Field>
      <Field>
        <FieldLabel>Invite code</FieldLabel>
        <OtpInput length={8} type="alphanumeric" size="sm" groupSize={4} defaultValue="K7Q2" />
        <FieldDescription>Letters and numbers, from the workspace invitation email.</FieldDescription>
      </Field>
    </div>
  );
}
