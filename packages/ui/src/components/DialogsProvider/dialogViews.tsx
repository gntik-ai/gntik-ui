import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { Alert } from '../Alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../AlertDialog';
import { Button } from '../Button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../Dialog';
import { Field, FieldError, FieldLabel } from '../Field';
import { Input } from '../Input';
import type { DialogEntry } from './dialogsStore';
import { dialogsVariants } from './dialogs.variants';

/** What the provider lends to every rendered dialog. */
export interface DialogsHost {
  settle: (id: string, value: unknown) => void;
  /** True while this dialog may act on Escape or an outside press (it is the topmost one). */
  canDismiss: (id: string) => boolean;
  canClose: (id: string) => boolean;
  finalFocus: (entry: DialogEntry) => () => HTMLElement | boolean | null;
}

interface ViewProps<K extends DialogEntry['spec']['kind']> {
  entry: DialogEntry & { spec: Extract<DialogEntry['spec'], { kind: K }> };
  host: DialogsHost;
}

const s = dialogsVariants();

const isThenable = (value: unknown): value is PromiseLike<void> =>
  typeof value === 'object' && value !== null && 'then' in value && typeof value.then === 'function';

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** `confirm()`: kit AlertDialog with an optional typed confirmation and a pending state. */
export function ConfirmView({ entry, host }: ViewProps<'confirm'>) {
  const { t } = useI18n();
  const { message, options } = entry.spec;
  const tone = options.tone ?? 'destructive';
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const matches = options.typeToConfirm === undefined || typed === options.typeToConfirm;

  const dismiss = () => {
    if (busyRef.current || !host.canDismiss(entry.id)) return;
    host.settle(entry.id, false);
  };
  const fail = (reason: unknown) => {
    busyRef.current = false;
    setBusy(false);
    setError(errorMessage(reason));
  };
  const confirm = () => {
    if (busyRef.current || !matches) return;
    setError(null);
    let outcome: void | Promise<void>;
    try {
      outcome = options.onConfirm?.();
    } catch (reason) {
      fail(reason);
      return;
    }
    if (!isThenable(outcome)) {
      host.settle(entry.id, true);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    outcome.then(() => host.settle(entry.id, true), fail);
  };
  const onFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    confirm();
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && dismiss()}>
      <AlertDialogContent finalFocus={host.finalFocus(entry)}>
        <AlertDialogHeader tone={tone}>
          <AlertDialogTitle>{options.title ?? message}</AlertDialogTitle>
          {options.title !== undefined && <AlertDialogDescription>{message}</AlertDialogDescription>}
        </AlertDialogHeader>
        {options.typeToConfirm !== undefined && (
          <Field className={s.field()}>
            <FieldLabel>{t('dialogs.typeToConfirm', { value: options.typeToConfirm })}</FieldLabel>
            <Input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={onFieldKeyDown}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
        )}
        {error !== null && <Alert tone="destructive" description={error} className={s.error()} />}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{options.cancelLabel ?? t('common.cancel')}</AlertDialogCancel>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'primary'}
            loading={busy}
            disabled={!matches}
            onClick={confirm}
          >
            {options.confirmLabel ?? t('dialogs.confirm')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** `alert()`: kit AlertDialog with a single acknowledging action. */
export function AlertView({ entry, host }: ViewProps<'alert'>) {
  const { t } = useI18n();
  const { message, options } = entry.spec;
  const tone = options.tone ?? 'info';
  const dismiss = () => {
    if (host.canDismiss(entry.id)) host.settle(entry.id, undefined);
  };
  return (
    <AlertDialog open onOpenChange={(open) => !open && dismiss()}>
      <AlertDialogContent finalFocus={host.finalFocus(entry)}>
        <AlertDialogHeader tone={tone}>
          <AlertDialogTitle>{options.title ?? message}</AlertDialogTitle>
          {options.title !== undefined && <AlertDialogDescription>{message}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction variant={tone === 'destructive' ? 'destructive' : 'primary'}>
            {options.okLabel ?? t('dialogs.ok')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** `prompt()`: kit Dialog with one validated text field; Enter submits. */
export function PromptView({ entry, host }: ViewProps<'prompt'>) {
  const { t } = useI18n();
  const { message, options } = entry.spec;
  const [value, setValue] = useState(options.defaultValue ?? '');
  const problem = options.validate?.(value);
  const dismiss = () => {
    if (host.canDismiss(entry.id)) host.settle(entry.id, null);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (problem === undefined && host.canDismiss(entry.id)) host.settle(entry.id, value);
  };
  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent size="sm" showClose={false} finalFocus={host.finalFocus(entry)}>
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>{options.title ?? message}</DialogTitle>
            {options.title !== undefined && <DialogDescription>{message}</DialogDescription>}
          </DialogHeader>
          <DialogBody>
            <Field invalid={problem !== undefined}>
              <FieldLabel>{options.label}</FieldLabel>
              <Input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={options.placeholder}
                autoComplete="off"
              />
              {problem !== undefined && <FieldError match>{problem}</FieldError>}
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>{options.cancelLabel ?? t('common.cancel')}</DialogClose>
            <Button type="submit" variant="primary" disabled={problem !== undefined}>
              {options.okLabel ?? t('dialogs.ok')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** `open()`: renders the caller's component with the payload and a guarded `onClose`. */
export function CustomView({ entry, host }: ViewProps<'custom'>) {
  const { Component, payload } = entry.spec;
  return (
    <Component
      payload={payload}
      open
      onClose={(result) => {
        if (host.canClose(entry.id)) host.settle(entry.id, result);
      }}
      finalFocus={host.finalFocus(entry)}
    />
  );
}
