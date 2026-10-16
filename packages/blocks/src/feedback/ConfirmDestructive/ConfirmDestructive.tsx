import { Lock, Trash2 } from '@gntik-ai/icons';
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
  EmptyState,
  Input,
  useI18n,
} from '@gntik-ai/ui';
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ErrorPanel } from '../ErrorPanel/ErrorPanel';
import { NotFoundEmpty } from '../EmptyStates/EmptyStates';

export type ConfirmDestructiveFailure =
  | { kind: 'server'; title: string; message?: string; status?: number; requestId?: string }
  | { kind: 'network'; title: string; message?: string }
  | { kind: 'no-access' | 'not-found'; title: string; description?: string };

function normalizeFailure(value: unknown): ConfirmDestructiveFailure | null {
  if (!value || typeof value !== 'object' || !('kind' in value) || !('title' in value)) return null;
  if (typeof value.title !== 'string' || !value.title.trim()) return null;
  const title = value.title;
  const message = 'message' in value && typeof value.message === 'string' ? value.message : undefined;
  if (value.kind === 'server') {
    return {
      kind: 'server',
      title,
      message,
      status:
        'status' in value && typeof value.status === 'number' && Number.isFinite(value.status)
          ? value.status
          : undefined,
      requestId: 'requestId' in value && typeof value.requestId === 'string' ? value.requestId : undefined,
    };
  }
  if (value.kind === 'network') return { kind: 'network', title, message };
  if (value.kind === 'no-access' || value.kind === 'not-found') {
    return {
      kind: value.kind,
      title,
      description: 'description' in value && typeof value.description === 'string' ? value.description : undefined,
    };
  }
  return null;
}

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
  /** Extra fields inside the form, outside its accessible description. */
  children?: ReactNode;
  /** Additional consumer validity; the exact typed-name match is always required. */
  canConfirm?: boolean;
  /** Focus destination when there is no internal trigger. Defaults to the opener. */
  returnFocusRef?: RefObject<HTMLElement | null>;
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
  consequences = [
    'All deployments and preview URLs',
    'Environment variables and secrets',
    'The audit log for this project',
  ],
  confirmLabel,
  triggerLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  onConfirm,
  children,
  canConfirm = true,
  returnFocusRef,
}: ConfirmDestructiveProps) {
  const { t } = useI18n();
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const focusedControl = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announcementId, setAnnouncementId] = useState(0);
  const [failure, setFailure] = useState<ConfirmDestructiveFailure | null>(null);
  const isOpen = open ?? innerOpen;
  const [previousOpen, setPreviousOpen] = useState(isOpen);
  const session = useRef(0);
  // Reset controlled closes during render so a reopened form never paints old values.
  if (previousOpen !== isOpen) {
    setPreviousOpen(isOpen);
    if (!isOpen) {
      setTyped('');
      setError(null);
      setFailure(null);
      setPending(false);
    }
  }
  useLayoutEffect(() => {
    session.current = session.current + 1;
    pendingRef.current = false;
    focusedControl.current = null;
    if (isOpen && document.activeElement instanceof HTMLElement) previousFocus.current = document.activeElement;
    return () => {
      session.current++;
    };
  }, [isOpen]);
  const label = confirmLabel ?? `Delete ${resourceType}`;
  const matches = typed === resourceName;
  const terminal = failure?.kind === 'no-access' || failure?.kind === 'not-found' ? failure : null;

  useLayoutEffect(() => {
    if (!isOpen || !popupRef.current) return;
    const popup = popupRef.current;
    const available = (element: HTMLElement | null, keepLoading = false) =>
      element?.isConnected &&
      popup.contains(element) &&
      !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
      (!element.matches(':disabled, [aria-disabled="true"]') ||
        (keepLoading && element.getAttribute('aria-busy') === 'true'));
    const restore = () => {
      if (!focusedControl.current || available(focusedControl.current, true)) return;
      // This composition disables secondary actions and details, so Retry is the last panel button.
      const retry = panelRef.current?.querySelectorAll<HTMLButtonElement>('button');
      const target = [
        retry?.item(retry.length - 1) ?? null,
        inputRef.current,
        cancelRef.current,
        closeRef.current,
      ].find((element) => available(element));
      target?.focus();
    };
    restore();
    const observer = new MutationObserver(restore);
    observer.observe(popup, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'hidden', 'inert', 'aria-hidden'],
    });
    return () => observer.disconnect();
  });

  const setOpen = (next: boolean) => {
    if (!next) {
      session.current++;
      pendingRef.current = false;
      setPending(false);
      setTyped('');
      setError(null);
      setFailure(null);
    }
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const confirm = async () => {
    if (!isOpen || !matches || canConfirm === false || pendingRef.current || terminal) return;
    const attemptSession = session.current;
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      await onConfirm?.();
      if (session.current !== attemptSession) return;
      pendingRef.current = false;
      setPending(false);
      setOpen(false);
    } catch (err) {
      if (session.current !== attemptSession) return;
      pendingRef.current = false;
      setPending(false);
      const next = normalizeFailure(err);
      setAnnouncementId((id) => id + 1);
      setFailure(next);
      setError(
        next
          ? [next.title, 'message' in next ? next.message : 'description' in next ? next.description : undefined]
              .filter(Boolean)
              .join(' ')
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Try again.',
      );
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(next) => !pending && setOpen(next)}>
      {triggerLabel !== null && (
        <AlertDialogTrigger ref={triggerRef} render={<Button variant="destructive" icon={Trash2} />}>
          {triggerLabel ?? label}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent
        ref={popupRef}
        initialFocus={inputRef}
        finalFocus={() => triggerRef.current ?? returnFocusRef?.current ?? previousFocus.current ?? true}
        onFocusCapture={(event) => {
          if (event.target !== event.currentTarget) focusedControl.current = event.target;
        }}
      >
        <AlertDialogHeader tone="destructive">
          <AlertDialogTitle>{title ?? `Delete ${resourceType}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (
              <>
                This permanently deletes <span className="font-mono text-foreground">{resourceName}</span>. This action
                cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {!terminal && consequences.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 rounded-md border border-destructive/25 bg-destructive/5 py-2.5 pe-3 ps-8 text-[12.5px] text-muted-foreground">
            {consequences.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirm();
          }}
          className="mt-4"
        >
          {terminal ? (
            terminal.kind === 'no-access' ? (
              <EmptyState icon={Lock} title={terminal.title} description={terminal.description ?? null} />
            ) : (
              <NotFoundEmpty title={terminal.title} description={terminal.description ?? null} />
            )
          ) : (
            <>
              {children}
              <Field>
                <FieldLabel>
                  Type <span className="font-mono font-semibold text-foreground">{resourceName}</span> to confirm
                </FieldLabel>
                <Input
                  ref={inputRef}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  readOnly={pending}
                />
              </Field>
              {(failure?.kind === 'server' || failure?.kind === 'network') && (
                <div ref={panelRef}>
                  <ErrorPanel
                    title={failure.title}
                    message={failure.message ?? null}
                    code={failure.kind === 'server' ? (failure.status ?? null) : null}
                    requestId={failure.kind === 'server' ? (failure.requestId ?? '') : ''}
                    details=""
                    secondaryAction={null}
                    retrying={pending}
                    retryLabel={t('error.retry')}
                    onRetry={() => confirm()}
                    announce={false}
                    className="mt-4"
                  />
                </div>
              )}
            </>
          )}
          {error !== null && (
            <p
              key={announcementId}
              role="alert"
              className={failure ? 'sr-only' : 'mt-2 text-[12.5px] text-destructive-text'}
            >
              {error}
            </p>
          )}
          <AlertDialogFooter className="mt-5">
            {terminal ? (
              <AlertDialogCancel ref={closeRef}>{t('common.close')}</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel ref={cancelRef} disabled={pending}>
                  {t('common.cancel')}
                </AlertDialogCancel>
                <Button
                  type="submit"
                  variant="destructive"
                  loading={pending}
                  disabled={!matches || canConfirm === false}
                >
                  {label}
                </Button>
              </>
            )}
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
