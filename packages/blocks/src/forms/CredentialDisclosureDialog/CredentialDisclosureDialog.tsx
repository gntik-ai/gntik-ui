import {
  Button, CopyButton, Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter, DialogClose, LiveAnnouncer,
  SecretField, CodeBlock, Alert, useI18n,
} from '@gntik-ai/ui';
import { useRef, useState, type ReactNode } from 'react';

export interface CredentialDisclosure {
  variant: 'stored' | 'fresh';
  credentialId: string;
  /** Caller-formatted expiry; the block applies no expiry policy. */
  expiresAt: ReactNode;
  secret: string;
}

export interface CredentialDisclosureDialogProps {
  /** Set only after a successful response. Leave null while pending or on failure. */
  disclosure: CredentialDisclosure | null;
  /** Clear disclosure to null on dismissal, dropping the secret in the consumer. */
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
 * Discloses an existing credential only after a successful response. Consumers keep disclosure
 * null while pending or on failure, and clear it on close. No pending/error state or internal
 * secret retention. A fresh secret requires a new successful response to be shown again.
 */
export function CredentialDisclosureDialog(props: CredentialDisclosureDialogProps) {
  if (!props.disclosure) return null;
  return <DisclosureOpening {...props} disclosure={props.disclosure} />;
}

type OpeningProps = CredentialDisclosureDialogProps & { disclosure: CredentialDisclosure };

function DisclosureOpening(props: OpeningProps) {
  // Keep the original opener across credential/value changes; the old popup is not an opener.
  const [opener] = useState(() => typeof document === 'undefined' ? null : document.activeElement);
  const { variant, credentialId, secret } = props.disclosure;
  // A new credential/value is a new session: reveal and announcement state cannot carry over.
  // React keys are never rendered as DOM attributes.
  return <DisclosureSession key={JSON.stringify([variant, credentialId, secret])} {...props} opener={opener} />;
}

function DisclosureSession({ disclosure, onClose, resolveReturnFocus, fallbackFocus, opener, ...labels }: OpeningProps & { opener: Element | null }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  const popup = useRef<HTMLDivElement>(null);
  const dismissed = useRef(false);
  const returnFocus = () => {
    const target = resolveReturnFocus?.();
    if (usableFocusTarget(target)) return target;
    const fallback = fallbackFocus?.();
    if (usableFocusTarget(fallback)) return fallback;
    return usableFocusTarget(opener) ? opener : false;
  };
  const closeLabel = labels.closeLabel ?? t('credentialDisclosure.close');
  const secretLabel = labels.secretLabel ?? t('credentialDisclosure.secret');
  return <Dialog open={open} onOpenChange={(next) => {
    if (!next && !dismissed.current) { dismissed.current = true; setOpen(false); onClose(); }
  }}>
    <DialogContent ref={popup} initialFocus={popup} finalFocus={returnFocus} showClose={false} closeLabel={closeLabel}>
      {open && <>
        <DialogHeader>
          <DialogTitle>{labels.title ?? t('credentialDisclosure.title')}</DialogTitle>
          <DialogDescription>{labels.description ?? t('credentialDisclosure.description')}</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">{labels.credentialIdLabel ?? t('credentialDisclosure.credentialId')}</dt>
            <dd className="break-all font-mono">{disclosure.credentialId}</dd>
            <dt className="text-muted-foreground">{labels.expiryLabel ?? t('credentialDisclosure.expiry')}</dt>
            <dd>{disclosure.expiresAt}</dd>
          </dl>
          <LiveAnnouncer>
            {disclosure.variant === 'stored' ? <SecretField value={disclosure.secret} copyable={false} aria-label={secretLabel}
              showLabel={labels.showLabel ?? t('credentialDisclosure.show')}
              hideLabel={labels.hideLabel ?? t('credentialDisclosure.hide')} /> : <>
              <Alert role="alert" tone="warning" title={labels.warningTitle ?? t('credentialDisclosure.warningTitle')}
                description={labels.warningText ?? t('credentialDisclosure.warningText')} />
              <CodeBlock code={disclosure.secret} copyable={false} label={secretLabel} wrapToggle={false} defaultWrap />
            </>}
            <CopyButton value={() => disclosure.secret} display="label"
              label={labels.copyLabel ?? t('credentialDisclosure.copy')}
              copiedLabel={labels.copiedLabel ?? t('credentialDisclosure.copied')}
              announcement={labels.successAnnouncement ?? t('credentialDisclosure.success')}
              failureLabel={labels.failureAnnouncement ?? t('credentialDisclosure.failure')}
              failureAnnouncement={labels.failureAnnouncement ?? t('credentialDisclosure.failure')}
              failurePoliteness="polite" />
          </LiveAnnouncer>
        </DialogBody>
        <DialogFooter><DialogClose render={<Button variant="secondary" />}>{closeLabel}</DialogClose></DialogFooter>
      </>}
    </DialogContent>
  </Dialog>;
}

/** Programmatic focus permits negative tabIndex, but never hidden, inert or disabled targets. */
function usableFocusTarget(element: Element | null | undefined): element is HTMLElement {
  if (!(element instanceof HTMLElement) || !element.isConnected || element === document.body) return false;
  if (element.matches(':disabled, [disabled], [aria-disabled="true"], input[type="hidden"]')) return false;
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hidden || ancestor.hasAttribute('inert') || ancestor.getAttribute('aria-disabled') === 'true') return false;
    const style = getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.contentVisibility === 'hidden') return false;
  }
  return element.tabIndex >= 0 || element.hasAttribute('tabindex') || element.isContentEditable;
}
