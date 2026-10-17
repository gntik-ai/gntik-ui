import { CodeBlock } from '@gntik-ai/ui';
import { useState } from 'react';
import { CredentialDisclosureDialog } from '../CredentialDisclosureDialog';
import { freshDisclosure } from '../fixtures';

/** All values and snippets are synthetic; closing unmounts every secret-bearing prop. */
export default function MultiSecret() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <CredentialDisclosureDialog
      disclosure={freshDisclosure}
      maskFresh
      onClose={() => setOpen(false)}
      secretLabel="Access key"
      additionalSecrets={[
        { id: 'dsn', label: 'DSN', value: 'synthetic_dsn_for_demo_only' },
        { id: 'password', label: 'Password', value: 'synthetic_password_for_demo_only' },
      ]}
      revealContent={
        <CodeBlock
          copyable={false}
          label="Integration examples"
          code={`fetch('/example', { headers: { Authorization: '${freshDisclosure.secret}' } })\ncurl -H 'Authorization: ${freshDisclosure.secret}' /example`}
        />
      }
    />
  );
}
