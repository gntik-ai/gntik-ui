import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { DialogsProvider, useDialogs } from '../index';

function RenameEnvironment() {
  const { prompt } = useDialogs();
  const [name, setName] = useState('staging');
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="secondary"
        icon={Pencil}
        onClick={async () => {
          const next = await prompt('Rename environment', {
            label: 'Name',
            defaultValue: name,
            okLabel: 'Rename',
            validate: (value) => (value.trim() === '' ? 'Enter a name.' : undefined),
          });
          if (next !== null) setName(next);
        }}
      >
        Rename environment
      </Button>
      <p aria-live="polite" className="text-[12px] text-muted-foreground">
        Current name: {name}
      </p>
    </div>
  );
}

/** Enter submits a valid value; OK stays disabled while the validator returns a message. */
export default function DialogsPrompt() {
  return (
    <DialogsProvider>
      <RenameEnvironment />
    </DialogsProvider>
  );
}
