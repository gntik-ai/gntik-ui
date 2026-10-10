import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Credential disclosure dialog',
  family: 'forms',
  status: 'beta',
  description: 'Controlled disclosure for an existing credential. Set disclosure ({variant: stored | fresh, credentialId, expiresAt: caller-formatted ReactNode, secret}) only after a successful response; null renders nothing while pending or on failure. Clear disclosure to null in onClose to drop the secret; a fresh secret requires a new successful response before showing it again. No pending/error state or internal secret retention. Stored values start masked; each null-to-value opening or changed credentialId/secret resets masking and copy feedback. Fresh values use a non-copyable CodeBlock with a kit CopyButton and a replacement warning. Optional English defaults through en/es i18n for title, description, credentialIdLabel, expiryLabel, secretLabel, showLabel, hideLabel, copyLabel, copiedLabel, successAnnouncement, failureAnnouncement, warningTitle, warningText and closeLabel. Copy results are announced politely, including manual-selection fallback. Popup initial focus and focus trapping use Base UI; at close, resolveReturnFocus() is validated for connection, visibility, enabled state and focusability, then fallbackFocus(), then the original opener. Synthetic fixtures only; the default Stored preview is masked and the Fresh preview starts closed.',
  uses: ['Dialog', 'SecretField', 'CodeBlock', 'CopyButton', 'Alert', 'LiveAnnouncer', 'Button'],
};
