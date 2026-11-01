import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { DialogsProvider, useDialogs } from '../index';

function DeleteDatabase() {
  const { confirm } = useDialogs();
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="secondary"
        icon={Trash2}
        disabled={deleted}
        onClick={async () => {
          const ok = await confirm('Every table and backup of this database is removed. This cannot be undone.', {
            title: 'Delete prod-db?',
            confirmLabel: 'Delete database',
            typeToConfirm: 'prod-db',
          });
          if (ok) setDeleted(true);
        }}
      >
        Delete database
      </Button>
      <p aria-live="polite" className="h-4 text-[12px] text-muted-foreground">
        {deleted ? 'Database deleted' : ''}
      </p>
    </div>
  );
}

/** The confirm button stays disabled until the exact, case-sensitive text is typed. */
export default function DialogsTypedConfirm() {
  return (
    <DialogsProvider>
      <DeleteDatabase />
    </DialogsProvider>
  );
}
