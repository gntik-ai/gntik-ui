import { Checkbox, Field, FieldLabel, Stack, Textarea } from '@gntik-ai/ui';
import { useState } from 'react';
import { ConfirmDestructive } from '../ConfirmDestructive';

/** Justification is optional here; use canConfirm to require it for a different policy. */
export default function SecretRevocation({ onConfirm }: { onConfirm?: () => void | Promise<void> }) {
  const [justification, setJustification] = useState('');
  const [forceRevoke, setForceRevoke] = useState(false);
  return (
    <ConfirmDestructive
      resourceName="version-7"
      resourceType="secret version"
      title="Revoke secret version?"
      confirmLabel="Revoke version"
      description="This is the last valid version. Revoking it may interrupt services that still use it."
      consequences={['Services must switch to a valid version before this one is revoked.']}
      onConfirm={onConfirm}
      onOpenChange={(open) => {
        if (!open) {
          setJustification('');
          setForceRevoke(false);
        }
      }}
    >
      <Stack gap={3} className="mb-4">
        <Field>
          <FieldLabel>Justification</FieldLabel>
          <Textarea value={justification} onChange={(event) => setJustification(event.target.value)} />
        </Field>
        <Checkbox label="Force revocation" checked={forceRevoke} onCheckedChange={setForceRevoke} />
      </Stack>
    </ConfirmDestructive>
  );
}
