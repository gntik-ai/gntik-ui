import { CodeBlock, CopyButton, LiveAnnouncer, SecretField, useI18n } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import type { CredentialSecret } from './types';

interface SecretCopyOptions {
  showLabel?: string;
  hideLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  successAnnouncement?: string;
  failureAnnouncement?: string;
  onCopy?: (id: string) => void;
  copiedAnnouncementFor?: (label: string) => string;
}

/** Each secret owns feedback so simultaneous settlements cannot overwrite each other. */
export function SecretCopy({
  secret,
  options,
  grouped = false,
  masked = true,
  warning,
}: {
  secret: CredentialSecret;
  options: SecretCopyOptions;
  grouped?: boolean;
  masked?: boolean;
  warning?: ReactNode;
}) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const copied = options.copiedLabel ?? t('credentialDisclosure.copied');
  const content = (
    <LiveAnnouncer>
      {warning}
      <div data-kit-redact>
        {masked ? (
          <SecretField
            value={secret.value}
            copyable={false}
            aria-label={secret.label}
            showLabel={options.showLabel ?? t('credentialDisclosure.show')}
            hideLabel={options.hideLabel ?? t('credentialDisclosure.hide')}
          />
        ) : (
          <CodeBlock code={secret.value} copyable={false} label={secret.label} wrapToggle={false} defaultWrap />
        )}
      </div>
      <CopyButton
        value={() => {
          if (grouped) setPending(true);
          return secret.value;
        }}
        loading={grouped && pending}
        display="label"
        label={options.copyLabel ?? t('credentialDisclosure.copy')}
        copiedLabel={copied}
        announcement={
          grouped
            ? (options.copiedAnnouncementFor?.(secret.label) ?? `${secret.label}: ${copied}`)
            : (options.successAnnouncement ?? t('credentialDisclosure.success'))
        }
        failureLabel={options.failureAnnouncement ?? t('credentialDisclosure.failure')}
        failureAnnouncement={options.failureAnnouncement ?? t('credentialDisclosure.failure')}
        failurePoliteness="polite"
        onCopy={() => {
          if (grouped) setPending(false);
          options.onCopy?.(secret.id);
        }}
        onCopyError={() => {
          if (grouped) setPending(false);
        }}
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
