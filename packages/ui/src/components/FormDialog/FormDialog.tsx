import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { Alert } from '../Alert';
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
  DialogTrigger,
  type DialogContentProps,
} from '../Dialog';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerContentProps,
  type DrawerSide,
} from '../Drawer';
import { formDialogVariants } from './form-dialog.variants';

/**
 * What `onSubmit` may return. Nothing or `true` closes the dialog; `false` keeps it open without
 * a message (the caller handled it); a string keeps it open and shows it. A thrown error or a
 * rejected promise keeps it open and shows its message.
 */
export type FormDialogResult = void | boolean | string;

interface FormDialogBaseProps {
  title: ReactNode;
  description?: ReactNode;
  /** Element that opens the dialog. Without children it is labelled by `title`. */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  /** Called for user-initiated closes that are allowed and for the close after a successful submit. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Receives the form's `FormData` (every named field). A returned promise puts the dialog in its
   * pending state until it settles; a synchronous result never does. Set request timeouts here:
   * closing is blocked while it is pending.
   */
  onSubmit: (data: FormData) => FormDialogResult | Promise<FormDialogResult>;
  /** Runs once after each close, when the exit animation has finished. */
  onClosed?: () => void;
  /** Default: the catalog's "Save". */
  submitLabel?: ReactNode;
  /** Default: the catalog's "Cancel". */
  cancelLabel?: ReactNode;
  /** Replaces Cancel and Submit. A submit button in it submits the form; a close control is blocked while pending. */
  footer?: ReactNode;
  /** Slot above the fields, under the submit error (a ValidationSummary, a titled Alert). */
  summary?: ReactNode;
  /** Keep the content, and so the field values, while closed. Default: unmounted on close. */
  keepMounted?: boolean;
  /** The fields. Give each a `name` so it reaches `FormData`. */
  children?: ReactNode;
}

interface FormDialogDialogProps {
  variant?: 'dialog';
  size?: DialogContentProps['size'];
  side?: never;
}

interface FormDialogDrawerProps {
  variant: 'drawer';
  size?: DrawerContentProps['size'];
  side?: DrawerSide;
}

export type FormDialogProps = FormDialogBaseProps & (FormDialogDialogProps | FormDialogDrawerProps);

const FIRST_FIELD =
  'input:not([type="hidden"]):not([type="file"]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [role="combobox"]:not(:disabled), button[data-slot="file-input"]:not(:disabled)';

const isThenable = (value: unknown): value is PromiseLike<FormDialogResult> =>
  typeof value === 'object' && value !== null && typeof (value as { then?: unknown }).then === 'function';

/**
 * A dialog or drawer that hosts a form and owns its lifecycle: trigger, submit with a pending
 * state, close on success, submit errors in an alert and reset on close. Works with any form
 * state; `useFormDialog` from `@gntik-ai/ui/forms` wires react-hook-form.
 */
export function FormDialog({
  title,
  description,
  trigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSubmit,
  onClosed,
  submitLabel,
  cancelLabel,
  footer,
  summary,
  keepMounted = false,
  children,
  variant = 'dialog',
  size,
  side,
}: FormDialogProps) {
  const { t } = useI18n();
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = openProp ?? innerOpen;
  // Synchronous, so two submits in one tick cannot both reach onSubmit.
  const pendingRef = useRef(false);
  // Bumped when the dialog closes or unmounts so a result that settles later is ignored.
  const generation = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  // A close that did not come from this component (the parent set `open` to false) drops pending state and the error.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setPending(false);
      setError(null);
    }
  }
  useEffect(() => {
    if (open) return;
    generation.current += 1;
    pendingRef.current = false;
  }, [open]);
  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  const changeOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const failureMessage = (reason: unknown) =>
    reason instanceof Error && reason.message !== '' ? reason.message : t('formDialog.failed');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    // React submit events bubble through the portal to a form that renders this dialog.
    event.preventDefault();
    event.stopPropagation();
    if (pendingRef.current || !open) return;
    const run = generation.current;
    const settle = (result: FormDialogResult) => {
      if (run !== generation.current) return;
      pendingRef.current = false;
      setPending(false);
      if (result === false) return;
      if (typeof result === 'string') setError(result === '' ? t('formDialog.failed') : result);
      else changeOpen(false);
    };
    const fail = (reason: unknown) => {
      if (run !== generation.current) return;
      pendingRef.current = false;
      setPending(false);
      setError(failureMessage(reason));
    };
    setError(null);
    let result: FormDialogResult | Promise<FormDialogResult>;
    try {
      result = onSubmit(new FormData(event.currentTarget));
    } catch (reason) {
      fail(reason);
      return;
    }
    if (!isThenable(result)) {
      settle(result);
      return;
    }
    pendingRef.current = true;
    setPending(true);
    result.then(settle, fail);
  };

  const handleOpenChange = (next: boolean, details: { cancel: () => void } = { cancel: () => undefined }) => {
    if (!next && pendingRef.current) {
      details.cancel();
      return;
    }
    changeOpen(next);
  };

  const handleOpenChangeComplete = (isOpen: boolean) => {
    if (!isOpen) onClosed?.();
  };

  // The popup, or a link in `summary`, would otherwise take the focus the first field should have.
  const focusFirstField = () => formRef.current?.querySelector<HTMLElement>(FIRST_FIELD) ?? true;

  const triggerChildren = isValidElement<{ children?: ReactNode }>(trigger) ? trigger.props.children : undefined;
  const triggerLabel = Children.count(triggerChildren) > 0 ? triggerChildren : title;

  const v = formDialogVariants({ variant });
  const isDrawer = variant === 'drawer';
  const Close = isDrawer ? DrawerClose : DialogClose;
  const Header = isDrawer ? DrawerHeader : DialogHeader;
  const Title = isDrawer ? DrawerTitle : DialogTitle;
  const Description = isDrawer ? DrawerDescription : DialogDescription;
  const Body = isDrawer ? DrawerBody : DialogBody;
  const Footer = isDrawer ? DrawerFooter : DialogFooter;

  const inner = (
    <>
      <Header>
        <Title>{title}</Title>
        {description != null && <Description>{description}</Description>}
      </Header>
      <form ref={formRef} noValidate aria-busy={pending || undefined} className={v.form()} onSubmit={submit}>
        <Body className={v.body()}>
          {error != null && <Alert tone="destructive" role="alert" description={error} />}
          {summary}
          {children}
        </Body>
        <Footer>
          {footer ?? (
            <>
              <Close render={<Button variant="ghost" disabled={pending} />}>{cancelLabel ?? t('common.cancel')}</Close>
              <Button type="submit" loading={pending}>
                {submitLabel ?? t('common.save')}
              </Button>
            </>
          )}
        </Footer>
      </form>
    </>
  );

  if (isDrawer) {
    return (
      <Drawer side={side} open={open} onOpenChange={handleOpenChange} onOpenChangeComplete={handleOpenChangeComplete}>
        {trigger && <DrawerTrigger render={trigger}>{triggerLabel}</DrawerTrigger>}
        <DrawerContent
          size={size as DrawerContentProps['size']}
          keepMounted={keepMounted}
          initialFocus={focusFirstField}
        >
          {inner}
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange} onOpenChangeComplete={handleOpenChangeComplete}>
      {trigger && <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>}
      <DialogContent size={size as DialogContentProps['size']} keepMounted={keepMounted} initialFocus={focusFirstField}>
        {inner}
      </DialogContent>
    </Dialog>
  );
}
