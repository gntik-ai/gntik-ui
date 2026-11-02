import { Rocket } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '../../Button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../Dialog';
import { DialogsProvider, useDialogs, type DialogComponentProps } from '../index';

interface DeployPayload {
  step: number;
  total: number;
}

type DeployResult = 'done' | 'stopped' | undefined;

function DeployDialog({ payload, open, onClose, finalFocus }: DialogComponentProps<DeployPayload, DeployResult>) {
  const { closeAll } = useDialogs();
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose('stopped')}>
      <DialogContent size="sm" showClose={false} finalFocus={finalFocus}>
        <DialogHeader>
          <DialogTitle>Deploying</DialogTitle>
          <DialogDescription>
            Step {payload.step} of {payload.total}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-[13px] text-muted-foreground">
            The caller moves this dialog along with update() and finishes it with close().
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => closeAll()}>
            Close all dialogs
          </Button>
          <Button variant="secondary" onClick={() => onClose('stopped')}>
            Stop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Deploy() {
  const { open, update, close } = useDialogs();
  const logRef = useRef<HTMLButtonElement>(null);
  const [outcome, setOutcome] = useState('Not started');

  const run = async () => {
    const total = 3;
    const dialog = open(DeployDialog, { step: 1, total }, { returnFocus: logRef.current });
    let step = 1;
    const timer = setInterval(() => {
      step += 1;
      if (step > total) {
        clearInterval(timer);
        close(dialog, 'done');
      } else {
        update(dialog, { step, total });
      }
    }, 700);
    const result = await dialog;
    clearInterval(timer);
    setOutcome(result === 'done' ? 'Deployed' : result === 'stopped' ? 'Stopped' : 'Closed');
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <Button variant="secondary" icon={Rocket} onClick={() => void run()}>
          Start deployment
        </Button>
        <Button ref={logRef} variant="ghost">
          Deployment log
        </Button>
      </div>
      <p aria-live="polite" className="text-[12px] text-muted-foreground">
        Deployment: {outcome}
      </p>
    </div>
  );
}

/**
 * `update()` re-renders an open dialog, `close()` resolves it from the caller, `closeAll()` settles every open dialog
 * and `returnFocus` sends focus to a chosen element (here the log button) once the stack is empty.
 */
export default function DialogsProgrammatic() {
  return (
    <DialogsProvider>
      <Deploy />
    </DialogsProvider>
  );
}
