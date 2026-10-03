import { Trash2 } from '@gntik-ai/icons';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Field,
  FieldLabel,
  Input,
} from '@gntik-ai/ui';
import { useState, type FormEvent, type ReactNode } from 'react';

export interface ConfirmDestructiveProps {
  /** Exact name the user must type to unlock the action. */
  resourceName?: string;
  /** What kind of resource it is (used in the default copy). */
  resourceType?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** What will be lost, as a short list. */
  consequences?: string[];
  /** Label of the confirming button (and of the default trigger). */
  confirmLabel?: string;
  /** Default trigger button text; `null` renders no trigger (control `open` instead). */
  triggerLabel?: string | null;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Runs on confirm. Returning a promise keeps the dialog open with a spinner until it settles; a rejection shows its message. */
  onConfirm?: () => void | Promise<void>;
}

/**
 * Typed-confirmation for irreversible actions: an AlertDialog whose destructive button stays
 * disabled until the resource name is typed exactly.
 */
export function ConfirmDestructive({
  resourceName = 'acme-web',
  resourceType = 'project',
  title,
  description,
  consequences = ['All deployments and preview URLs', 'Environment variables and secrets', 'The audit log for this project'],
  confirmLabel,
  triggerLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  onConfirm,
}: ConfirmDestructiveProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOpen = open ?? innerOpen;
  const label = confirmLabel ?? `Delete ${resourceType}`;
  const matches = typed === resourceName;

  const setOpen = (next: boolean) => {
    if (!next) {
      setTyped('');
      setError(null);
    }
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    if (!matches || pending) return;
    setPending(true);
    setError(null);
    try {
      await onConfirm?.();
      setPending(false);
      setOpen(false);
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(next) => !pending && setOpen(next)}>
      {triggerLabel !== null && (
        <AlertDialogTrigger render={<Button variant="destructive" icon={Trash2} />}>{triggerLabel ?? label}</AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader tone="destructive">
          <AlertDialogTitle>{title ?? `Delete ${resourceType}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (
              <>
                This permanently deletes <span className="font-mono text-foreground">{resourceName}</span>. This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {consequences.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 rounded-md border border-destructive/25 bg-destructive/5 py-2.5 pe-3 ps-8 text-[12.5px] text-muted-foreground">
            {consequences.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        <form onSubmit={(e) => void confirm(e)} className="mt-4">
          <Field>
            <FieldLabel>
              Type <span className="font-mono font-semibold text-foreground">{resourceName}</span> to confirm
            </FieldLabel>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
            />
          </Field>
          {error && (
            <p role="alert" className="mt-2 text-[12.5px] text-destructive-text">
              {error}
            </p>
          )}
          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive" loading={pending} disabled={!matches}>
              {label}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
