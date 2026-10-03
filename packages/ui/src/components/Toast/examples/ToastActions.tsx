import { useState } from 'react';
import { Button } from '../../Button';
import { ToastProvider, Toaster, useToast } from '../Toast';

function InviteButton() {
  const toast = useToast();
  const [status, setStatus] = useState('No reply yet');
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            tone: 'info',
            title: 'You were invited to “Platform”',
            description: 'Join the workspace to see its projects.',
            timeout: 10000,
            action: { label: 'Accept', onClick: () => setStatus('Accepted') },
            dismissAction: { label: 'Not now', onClick: () => setStatus('Postponed') },
          })
        }
      >
        Show invitation
      </Button>
      <p className="h-4 text-[12px] text-muted-foreground">{status}</p>
    </div>
  );
}

export default function ToastActions() {
  return (
    <ToastProvider>
      <InviteButton />
      <Toaster />
    </ToastProvider>
  );
}
