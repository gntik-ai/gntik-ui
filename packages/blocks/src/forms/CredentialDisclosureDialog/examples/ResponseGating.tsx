import { Alert, Button } from '@gntik-ai/ui';
import { useRef, useState } from 'react';
import { CredentialDisclosureDialog, type CredentialDisclosure } from '../CredentialDisclosureDialog';
import { storedDisclosure } from '../fixtures';

/** Pending/error UI belongs to the consumer; only a successful response sets disclosure. */
export default function ResponseGating() {
  const [disclosure, setDisclosure] = useState<CredentialDisclosure | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'failed'>('idle');
  const heading = useRef<HTMLHeadingElement>(null);
  const requestId = useRef(0);
  const request = async (result: 'pending' | 'failed' | 'success') => {
    const id = ++requestId.current;
    setDisclosure(null);
    setStatus('pending');
    try {
      const response = await (result === 'pending' ? new Promise<CredentialDisclosure>(() => {})
        : result === 'failed' ? Promise.reject(new Error('Synthetic request failure')) : Promise.resolve(storedDisclosure));
      if (id === requestId.current) { setStatus('idle'); setDisclosure(response); }
    } catch {
      if (id === requestId.current) setStatus('failed');
    }
  };
  return <>
    <h1 ref={heading} tabIndex={-1}>Credentials</h1>
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => { void request('pending'); }}>Request pending response</Button>
      <Button onClick={() => { void request('failed'); }}>Request rejected response</Button>
      <Button onClick={() => { void request('success'); }}>Request successful response</Button>
    </div>
    {status === 'pending' && <p>Request pending</p>}
    {status === 'failed' && <Alert tone="destructive" title="Request failed" description="No credential was disclosed." />}
    <CredentialDisclosureDialog disclosure={disclosure} onClose={() => setDisclosure(null)} fallbackFocus={() => heading.current} />
  </>;
}
