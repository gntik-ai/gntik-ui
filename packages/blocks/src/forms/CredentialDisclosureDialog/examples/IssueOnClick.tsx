import { Alert, Button } from '@gntik-ai/ui';
import { useEffect, useRef, useState } from 'react';
import { CredentialDisclosureDialog, type CredentialDisclosure } from '../CredentialDisclosureDialog';
import { freshDisclosure } from '../fixtures';

const syntheticRequest = async () => ({ ...freshDisclosure });

/** Page recipe: the caller owns issuance, cancellation and errors. Fixtures are synthetic. */
export default function IssueOnClick({
  request = syntheticRequest,
}: {
  request?: (signal: AbortSignal) => Promise<CredentialDisclosure>;
}) {
  const [disclosure, setDisclosure] = useState<CredentialDisclosure | null>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const current = useRef<AbortController | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(
    () => () => {
      current.current?.abort();
    },
    [],
  );
  const issue = async () => {
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    setDisclosure(null);
    setFailed(false);
    setPending(true);
    try {
      const response = await request(controller.signal);
      if (!controller.signal.aborted) setDisclosure(response);
    } catch {
      if (!controller.signal.aborted) setFailed(true);
    } finally {
      if (!controller.signal.aborted) {
        current.current = null;
        setPending(false);
      }
    }
  };
  return (
    <>
      <h1>Issue a credential</h1>
      <div className="flex flex-wrap gap-2">
        <Button
          ref={trigger}
          loading={pending}
          onClick={() => {
            void issue();
          }}
        >
          Issue credential
        </Button>
        {pending && (
          <>
            <Button
              onClick={() => {
                current.current?.abort();
                current.current = null;
                setPending(false);
              }}
            >
              Cancel request
            </Button>
            <Button
              onClick={() => {
                void issue();
              }}
            >
              Supersede request
            </Button>
          </>
        )}
      </div>
      {failed && <Alert tone="destructive" title="Request failed" description="No credential was disclosed." />}
      <CredentialDisclosureDialog
        disclosure={disclosure}
        maskFresh
        onClose={() => setDisclosure(null)}
        resolveReturnFocus={() => trigger.current}
      />
    </>
  );
}
