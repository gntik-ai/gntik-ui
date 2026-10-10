import { Button } from '@gntik-ai/ui';
import { useRef, useState } from 'react';
import { CredentialDisclosureDialog, type CredentialDisclosure } from '../CredentialDisclosureDialog';
import { freshDisclosure } from '../fixtures';

/** Closed on load: no preview or visual baseline exposes the synthetic fresh value. */
export default function Fresh() {
  const [disclosure, setDisclosure] = useState<CredentialDisclosure | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <h1 ref={heading} tabIndex={-1}>Credentials</h1>
    <Button ref={trigger} onClick={() => { void Promise.resolve({ ...freshDisclosure }).then(setDisclosure); }}>Disclose fresh secret</Button>
    <CredentialDisclosureDialog disclosure={disclosure} onClose={() => setDisclosure(null)}
      resolveReturnFocus={() => trigger.current} fallbackFocus={() => heading.current} />
  </>;
}
