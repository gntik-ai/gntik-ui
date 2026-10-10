import { Button } from '@gntik-ai/ui';
import { useRef, useState } from 'react';
import { CredentialDisclosureDialog, type CredentialDisclosure } from '../CredentialDisclosureDialog';
import { storedDisclosure } from '../fixtures';

/** The initial synthetic stored value stays masked in catalog previews and visual baselines. */
export default function Stored() {
  const [disclosure, setDisclosure] = useState<CredentialDisclosure | null>(storedDisclosure);
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <h1 ref={heading} tabIndex={-1}>Credentials</h1>
    <Button ref={trigger} onClick={() => { void Promise.resolve(storedDisclosure).then(setDisclosure); }}>Disclose stored secret</Button>
    <CredentialDisclosureDialog disclosure={disclosure} onClose={() => setDisclosure(null)}
      resolveReturnFocus={() => trigger.current} fallbackFocus={() => heading.current} />
  </>;
}
