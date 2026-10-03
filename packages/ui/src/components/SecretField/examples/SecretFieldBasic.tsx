import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { SecretField } from '../SecretField';

const DAY = 24 * 3600 * 1000;

export default function SecretFieldBasic() {
  const [now] = useState(() => Date.now());
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>API key</FieldLabel>
        <SecretField value="sk_live_51Hc8xQ2eZvKYlo2C9a7d" visiblePrefix={8} visibleSuffix={4} createdAt={now - 12 * DAY} lastUsedAt={now - 2 * 3600 * 1000} />
      </Field>
      <Field>
        <FieldLabel>Webhook signing secret</FieldLabel>
        <SecretField value="whsec_3f9a0c1b7e2d4f6a8b0c" size="sm" lastUsedAt={null} />
        <FieldDescription>Verify the signature header with this value.</FieldDescription>
      </Field>
    </div>
  );
}
