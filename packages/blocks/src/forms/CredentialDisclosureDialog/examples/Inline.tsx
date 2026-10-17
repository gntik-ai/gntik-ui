import { useState } from 'react';
import { CredentialDisclosureDialog } from '../CredentialDisclosureDialog';
import { freshDisclosure } from '../fixtures';

export default function Inline() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <CredentialDisclosureDialog
      disclosure={freshDisclosure}
      presentation="inline"
      maskFresh
      onClose={() => setOpen(false)}
      title="Connection credentials"
      secretLabel="DSN"
      additionalSecrets={[{ id: 'password', label: 'Password', value: 'synthetic_password_for_demo_only' }]}
    />
  );
}
