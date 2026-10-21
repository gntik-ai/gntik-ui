import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
  Alert,
  useI18n,
} from '@gntik-ai/ui';
import { useEffectEvent, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { SecretCopy } from './SecretCopy';
import { usableFocusTarget } from './focus';
import type { CredentialSecret } from './types';

export type { CredentialSecret } from './types';

export interface CredentialDisclosure {
  variant: 'stored' | 'fresh';
  credentialId: string;
  /** Caller-formatted expiry; the block applies no expiry policy. */
  expiresAt: ReactNode;
  secret: string;
}

export interface CredentialDisclosureDialogLabels {
  title: string;
  description: string;
  credentialIdLabel: string;
  expiryLabel: string;
  secretLabel: string;
  showLabel: string;
  hideLabel: string;
  copyLabel: string;
  copiedLabel: string;
  successAnnouncement: string;
  failureAnnouncement: string;
  warningTitle: string;
  warningText: string;
  closeLabel: string;
  copiedAnnouncementFor: (label: string, copied: string) => string;
}

export interface CredentialDisclosureDialogProps {
  labels?: Partial<CredentialDisclosureDialogLabels>;
  /** Additional masked values; ids must be unique, non-empty and not "secret". */
  additionalSecrets?: readonly CredentialSecret[];
  /** Mask a fresh primary secret; read at the start of each session. */
  maskFresh?: boolean;
  /** Redacted content below the secrets; clear secret-bearing content on close. */
  revealContent?: ReactNode;
  /** Presentation fixed for each non-null opening. Defaults to a modal dialog. */
  presentation?: 'dialog' | 'inline';
  /** Called after copying with the secret id (primary: "secret"), never its value. */
  onCopy?: (id: string) => void;
  /** Label-only success announcement override, used only in multi-secret mode. */
  copiedAnnouncementFor?: (label: string) => string;
  /** Set only after a successful response. Leave null while pending or on failure. */
  disclosure: CredentialDisclosure | null;
  /** Clear disclosure, additionalSecrets and secret-bearing revealContent on dismissal. */
  onClose: () => void;
  /** Resolve the current row action at close time, including after list reloads. */
  resolveReturnFocus?: () => HTMLElement | null;
  /** Resolve a fallback such as a page heading with tabIndex={-1}. */
  fallbackFocus?: () => HTMLElement | null;
  title?: string;
  description?: string;
  credentialIdLabel?: string;
  expiryLabel?: string;
  secretLabel?: string;
  showLabel?: string;
  hideLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  successAnnouncement?: string;
  failureAnnouncement?: string;
  warningTitle?: string;
  warningText?: string;
  closeLabel?: string;
}

/**
 * Render only successful responses. Keep disclosure null while pending or on failure.
 * On close, clear disclosure, additionalSecrets and any secret-bearing revealContent.
 * No pending/error state or internal secret retention. Retained dismissed sessions stay closed;
 * a changed credential/value or a null-to-value opening starts a new session.
 */
export function CredentialDisclosureDialog(props: CredentialDisclosureDialogProps) {
  if (!props.disclosure) return null;
  return <DisclosureOpening {...props} disclosure={props.disclosure} />;
}

type OpeningProps = CredentialDisclosureDialogProps & { disclosure: CredentialDisclosure };
type FocusScope = {
  onRootRef: (node: HTMLElement | null) => void;
  onTargetRef: (node: HTMLElement | null) => void;
  onPopupRef: (node: HTMLDivElement | null) => void;
  containsFocus: () => boolean;
  initialFocus: () => HTMLElement | false | null;
};

function DisclosureOpening(props: OpeningProps) {
  const [opener] = useState(() => (typeof document === 'undefined' ? null : document.activeElement));
  const [presentation] = useState(props.presentation ?? 'dialog');
  const root = useRef<HTMLElement>(null);
  const target = useRef<HTMLElement>(null);
  const active = useRef<Element | null>(opener);
  const started = useRef(false);
  const activeWasInside = useRef(false);
  const returnFocus = () => {
    const current = props.resolveReturnFocus?.();
    if (usableFocusTarget(current)) return current;
    const fallback = props.fallbackFocus?.();
    if (usableFocusTarget(fallback)) return fallback;
    return usableFocusTarget(opener) ? opener : false;
  };
  const restore = useEffectEvent(() => {
    if (root.current?.contains(document.activeElement)) {
      const element = returnFocus();
      if (element) element.focus();
    }
  });
  useLayoutEffect(() => {
    const track = () => {
      if (document.activeElement !== document.body) {
        active.current = document.activeElement;
        activeWasInside.current = root.current?.contains(document.activeElement) ?? false;
      }
    };
    document.addEventListener('focusin', track);
    return () => {
      document.removeEventListener('focusin', track);
      restore();
    };
  }, [presentation]);
  useLayoutEffect(() => {
    // A surviving focused control wins, including one outside the disclosure.
    if (activeWasInside.current && active.current && !active.current.isConnected) target.current?.focus();
  });
  const seen = new Set(['secret', '']);
  const additionalSecrets = (props.additionalSecrets ?? []).filter(({ id }) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const { variant, credentialId, secret } = props.disclosure;
  return (
    <DisclosureSession
      key={JSON.stringify([variant, credentialId, secret, ...additionalSecrets.map(({ id, value }) => [id, value])])}
      {...props}
      presentation={presentation}
      additionalSecrets={additionalSecrets}
      onRootRef={(node) => {
        root.current = node;
      }}
      onTargetRef={(node) => {
        target.current = node;
      }}
      onPopupRef={(node) => {
        root.current = node;
        target.current = node;
      }}
      containsFocus={() => root.current?.contains(document.activeElement) ?? false}
      initialFocus={() => {
        const shouldFocus = !started.current || (activeWasInside.current && !active.current?.isConnected);
        started.current = true;
        return shouldFocus ? root.current : false;
      }}
      returnFocus={returnFocus}
    />
  );
}

function DisclosureSession(props: OpeningProps & FocusScope & { returnFocus: () => HTMLElement | false }) {
  const { t } = useI18n();
  const {
    disclosure,
    onRootRef,
    onTargetRef,
    onPopupRef,
    initialFocus,
    containsFocus,
    presentation,
    additionalSecrets = [],
  } = props;
  const [open, setOpen] = useState(true);
  const [maskFresh] = useState(props.maskFresh ?? false);
  const dismissed = useRef(false);
  const headingId = useId();
  const close = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (presentation === 'inline' && containsFocus()) {
      const element = props.returnFocus();
      if (element) element.focus();
    }
    setOpen(false);
    props.onClose();
  };
  const closeLabel = props.closeLabel ?? props.labels?.closeLabel ?? t('credentialDisclosure.close');
  const title = props.title ?? props.labels?.title ?? t('credentialDisclosure.title');
  const description = props.description ?? props.labels?.description ?? t('credentialDisclosure.description');
  const secretLabel = props.secretLabel ?? props.labels?.secretLabel ?? t('credentialDisclosure.secret');
  const warning =
    disclosure.variant === 'fresh' ? (
      <Alert
        role={presentation === 'inline' ? 'note' : 'alert'}
        tone="warning"
        title={props.warningTitle ?? props.labels?.warningTitle ?? t('credentialDisclosure.warningTitle')}
        description={props.warningText ?? props.labels?.warningText ?? t('credentialDisclosure.warningText')}
      />
    ) : null;
  const body = (
    <>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">
          {props.credentialIdLabel ?? props.labels?.credentialIdLabel ?? t('credentialDisclosure.credentialId')}
        </dt>
        <dd className="break-all font-mono">{disclosure.credentialId}</dd>
        <dt className="text-muted-foreground">
          {props.expiryLabel ?? props.labels?.expiryLabel ?? t('credentialDisclosure.expiry')}
        </dt>
        <dd>{disclosure.expiresAt}</dd>
      </dl>
      <SecretCopy
        secret={{ id: 'secret', label: secretLabel, value: disclosure.secret }}
        options={props}
        grouped={additionalSecrets.length > 0}
        masked={disclosure.variant === 'stored' || maskFresh}
        warning={warning}
      />
      {additionalSecrets.map((secret) => (
        <SecretCopy key={secret.id} secret={secret} options={props} grouped />
      ))}
      {props.revealContent != null && <div data-kit-redact>{props.revealContent}</div>}
    </>
  );
  if (presentation === 'inline') {
    if (!open) return null;
    return (
      <section ref={onRootRef} aria-labelledby={headingId} className="grid gap-4">
        <h2 id={headingId} tabIndex={-1} ref={onTargetRef}>
          {title}
        </h2>
        <p>{description}</p>
        {body}
        <Button variant="secondary" onClick={close}>
          {closeLabel}
        </Button>
      </section>
    );
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent
        ref={onPopupRef}
        initialFocus={initialFocus}
        finalFocus={() => (dismissed.current ? props.returnFocus() : false)}
        showClose={false}
        closeLabel={closeLabel}
      >
        {open && (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogBody className="grid gap-4">{body}</DialogBody>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary" />}>{closeLabel}</DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
