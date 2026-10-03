import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Alert,
  Button,
  Field,
  FieldLabel,
  Input,
} from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';

export interface ConfirmDestructiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  /** Text that must be typed exactly to enable the confirming button. */
  confirmText?: string;
  confirmLabel: string;
  /** Runs on confirm; a returned promise shows a loading state and keeps the dialog open until it settles. */
  onConfirm?: () => void | Promise<void>;
}

/** Destructive confirmation (alertdialog) that can require typing the resource name first. */
export function ConfirmDestructiveDialog({ open, onOpenChange, title, description, confirmText, confirmLabel, onConfirm }: ConfirmDestructiveDialogProps) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = confirmText == null || typed === confirmText;

  const change = (next: boolean) => {
    if (loading) return;
    if (!next) {
      setTyped('');
      setError(null);
    }
    onOpenChange(next);
  };

  const confirm = async () => {
    if (!matches) return;
    setError(null);
    setLoading(true);
    try {
      await onConfirm?.();
      setLoading(false);
      setTyped('');
      onOpenChange(false);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={change}>
      <AlertDialogContent size="md">
        <AlertDialogHeader tone="destructive">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <form
          className="mt-5 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void confirm();
          }}
        >
          {confirmText != null && (
            <Field>
              <FieldLabel>
                Type <span className="font-mono font-semibold text-foreground">{confirmText}</span> to confirm
              </FieldLabel>
              <Input value={typed} onValueChange={setTyped} autoComplete="off" spellCheck={false} disabled={loading} />
            </Field>
          )}
          {error && <Alert tone="destructive" description={error} />}
          <AlertDialogFooter className="mt-1">
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={!matches} loading={loading}>
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
