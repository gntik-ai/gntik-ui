import { useState } from 'react';
import { Field, FieldLabel } from '../../Field';
import { SecretField } from '../SecretField';

function randomToken() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return 'tok_' + Array.from({ length: 24 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

/** Rotate asks for confirmation, then swaps in a new value. `editable` makes it a password field. */
export default function SecretFieldRotate() {
  const [token, setToken] = useState('tok_9d2k1m7q4w8e6r0t3y5u');
  const [rotatedAt, setRotatedAt] = useState(() => Date.now() - 40 * 24 * 3600 * 1000);
  const [dsn, setDsn] = useState('postgres://app:change-me@db.internal:5432/app');
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Deploy token</FieldLabel>
        <SecretField
          value={token}
          createdAt={rotatedAt}
          onRotate={async () => {
            await new Promise((resolve) => setTimeout(resolve, 600));
            setToken(randomToken());
            setRotatedAt(Date.now());
          }}
        />
      </Field>
      <Field>
        <FieldLabel>Connection string</FieldLabel>
        <SecretField value={dsn} editable onValueChange={setDsn} copyable={false} />
      </Field>
    </div>
  );
}
