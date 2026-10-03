import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../AlertDialog';

export default function AlertDialogDelete() {
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="secondary" icon={Trash2} />}>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader tone="destructive">
            <AlertDialogTitle>Delete “support-triage”?</AlertDialogTitle>
            <AlertDialogDescription>
              Its deployments, logs and metrics will be removed for every member. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction icon={Trash2} onClick={() => setDeleted(true)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p aria-live="polite" className="h-4 text-[12px] text-muted-foreground">
        {deleted ? 'Project deleted' : ''}
      </p>
    </div>
  );
}
