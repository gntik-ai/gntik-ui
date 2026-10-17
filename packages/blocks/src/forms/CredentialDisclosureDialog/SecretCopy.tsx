import { CodeBlock, CopyButton, LiveAnnouncer, SecretField, useI18n } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import type { CredentialDisclosureDialogProps, CredentialSecret } from './CredentialDisclosureDialog';

/** Each secret owns feedback so simultaneous settlements cannot overwrite each other. */
export function SecretCopy({
  secret,
  labels,
  grouped = false,
  masked = true,
  warning,
}: {
  secret: CredentialSecret;
  labels: CredentialDisclosureDialogProps;
  grouped?: boolean;
  masked?: boolean;
  warning?: ReactNode;
}) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const copied = labels.copiedLabel ?? t('credentialDisclosure.copied');
  const content = (
    <LiveAnnouncer>
      {warning}
      <div data-kit-redact>
        {masked ? (
          <SecretField
            value={secret.value}
            copyable={false}
            aria-label={secret.label}
            showLabel={labels.showLabel ?? t('credentialDisclosure.show')}
            hideLabel={labels.hideLabel ?? t('credentialDisclosure.hide')}
          />
        ) : (
          <CodeBlock code={secret.value} copyable={false} label={secret.label} wrapToggle={false} defaultWrap />
        )}
      </div>
      <CopyButton
        value={() => {
          setPending(true);
          return secret.value;
        }}
        loading={pending}
        display="label"
        label={labels.copyLabel ?? t('credentialDisclosure.copy')}
        copiedLabel={copied}
        announcement={
          grouped
            ? (labels.copiedAnnouncementFor?.(secret.label) ?? `${secret.label}: ${copied}`)
            : (labels.successAnnouncement ?? t('credentialDisclosure.success'))
        }
        failureLabel={labels.failureAnnouncement ?? t('credentialDisclosure.failure')}
        failureAnnouncement={labels.failureAnnouncement ?? t('credentialDisclosure.failure')}
        failurePoliteness="polite"
        onCopy={() => {
          setPending(false);
          labels.onCopy?.(secret.id);
        }}
        onCopyError={() => setPending(false)}
      />
    </LiveAnnouncer>
  );
  return grouped ? (
    <div role="group" aria-label={secret.label}>
      {content}
    </div>
  ) : (
    content
  );
}
