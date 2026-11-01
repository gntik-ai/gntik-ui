import { KeyRound } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '../../Button';
import { DialogsProvider, useDialogs } from '../index';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function RotateKey() {
  const { confirm } = useDialogs();
  const attempts = useRef(0);
  const [rotated, setRotated] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="secondary"
        icon={KeyRound}
        onClick={async () => {
          const ok = await confirm('The old key keeps working for one hour after rotation.', {
            title: 'Rotate API key?',
            tone: 'warning',
            confirmLabel: 'Rotate',
            onConfirm: async () => {
              await wait(900);
              // The first attempt fails so the inline error and the retry are visible.
              attempts.current += 1;
              if (attempts.current === 1) {
                throw new Error('Key in use by a running deployment. Try again.');
              }
            },
          });
          if (ok) setRotated(true);
        }}
      >
        Rotate key
      </Button>
      <p aria-live="polite" className="h-4 text-[12px] text-muted-foreground">
        {rotated ? 'Key rotated' : ''}
      </p>
    </div>
  );
}

/** While the action runs the dialog stays open; a failure is shown inline and can be retried. */
export default function DialogsAsyncConfirm() {
  return (
    <DialogsProvider>
      <RotateKey />
    </DialogsProvider>
  );
}
