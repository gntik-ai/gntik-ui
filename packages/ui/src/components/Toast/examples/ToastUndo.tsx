import { Archive } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { ToastProvider, Toaster, useToast } from '../Toast';

function ArchiveButton() {
  const toast = useToast();
  const [archived, setArchived] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="secondary"
        icon={Archive}
        disabled={archived}
        onClick={() => {
          setArchived(true);
          toast.add({
            tone: 'success',
            title: 'Project archived',
            description: 'Members lose access in 30 days.',
            timeout: 8000,
            action: { label: 'Undo', onClick: () => setArchived(false) },
          });
        }}
      >
        Archive project
      </Button>
      <p className="h-4 text-[12px] text-muted-foreground">{archived ? 'Archived' : 'Active'}</p>
    </div>
  );
}

export default function ToastUndo() {
  return (
    <ToastProvider>
      <ArchiveButton />
      <Toaster />
    </ToastProvider>
  );
}
