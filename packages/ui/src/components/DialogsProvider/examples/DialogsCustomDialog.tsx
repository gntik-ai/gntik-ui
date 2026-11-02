import { useState } from 'react';
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
import { Field, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import { DialogsProvider, useDialogs, type DialogComponentProps } from '../index';

interface RenamePayload {
  name: string;
}

function RenameDialog({ payload, open, onClose, finalFocus }: DialogComponentProps<RenamePayload, string | null>) {
  const { confirm } = useDialogs();
  const [value, setValue] = useState(payload.name);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose(null)}>
      <DialogContent size="sm" showClose={false} finalFocus={finalFocus}>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>Currently “{payload.name}”.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>Project name</FieldLabel>
            <Input value={value} onChange={(event) => setValue(event.target.value)} autoComplete="off" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={async () => {
              // A confirm opened from here stacks on top; Escape closes only the confirm.
              if (value === payload.name || (await confirm('Your edit is lost.', { title: 'Discard changes?' }))) {
                onClose(null);
              }
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onClose(value)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectName() {
  const { open } = useDialogs();
  const [name, setName] = useState('support-triage');
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="secondary"
        onClick={async () => {
          const next = await open(RenameDialog, { name });
          if (next) setName(next);
        }}
      >
        Rename project
      </Button>
      <p aria-live="polite" className="text-[12px] text-muted-foreground">
        Project: {name}
      </p>
    </div>
  );
}

/** `open()` renders your own dialog and resolves with the value passed to `onClose`. */
export default function DialogsCustomDialog() {
  return (
    <DialogsProvider>
      <ProjectName />
    </DialogsProvider>
  );
}
