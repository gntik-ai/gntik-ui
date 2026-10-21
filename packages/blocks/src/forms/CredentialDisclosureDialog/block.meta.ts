import type { BlockMeta } from '../../meta';
import type { CredentialDisclosureDialogLabels } from './CredentialDisclosureDialog';

export const meta: BlockMeta = {
  name: 'Credential disclosure dialog',
  family: 'forms',
  status: 'beta',
  description:
    'Controlled disclosure for an existing credential. Set disclosure ({variant: stored | fresh, credentialId, expiresAt: caller-formatted ReactNode, secret}) only after a successful response; null renders nothing while pending or on failure. Clear disclosure, additionalSecrets and secret-bearing revealContent in onClose to drop every secret; a fresh secret requires a new successful response before showing it again. No pending/error state or internal secret retention. Stored values start masked; each null-to-value opening or changed credentialId/secret resets masking and copy feedback. Fresh values use a non-copyable CodeBlock with a kit CopyButton and a replacement warning, or a masked SecretField when maskFresh is set at session start. Optional additionalSecrets ({id, label, value}) are always masked and use independent toggles and serialized copy actions; ids must be non-empty, unique and not secret, with the first duplicate winning. Multi-secret groups announce label plus copiedLabel, or copiedAnnouncementFor(label); onCopy(id) never receives a value. Every secret and the optional revealContent slot have data-kit-redact. The session key includes additional ids and values. presentation is dialog by default or inline, fixed until the next opening: inline is a named section, never traps focus or handles Escape, and its warning is a non-live note. Surviving focus stays; removing the focused slot or session control focuses the popup or inline heading. Focused inline unmounts return focus through the same resolvers. Dismissed retained props stay hidden; clear and re-set or change a session value to reopen. Optional English defaults through en/es i18n for title, description, credentialIdLabel, expiryLabel, secretLabel, showLabel, hideLabel, copyLabel, copiedLabel, successAnnouncement, failureAnnouncement, warningTitle, warningText and closeLabel. Copy results are announced politely, including manual-selection fallback. Popup initial focus and focus trapping use Base UI; at close, resolveReturnFocus() is validated for connection, visibility, enabled state and focusability, then fallbackFocus(), then the original opener. Synthetic fixtures only; the default Stored preview is masked and the Fresh preview starts closed. Optional labels?: Partial<CredentialDisclosureDialogLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=credential-disclosure-dialog--labels.',
  labels: [
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: 'string', state: 'Default content and accessible names' },
    { key: 'credentialIdLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'expiryLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'secretLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'showLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'hideLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'copyLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'copiedLabel', type: 'string', state: 'Async feedback' },
    { key: 'successAnnouncement', type: 'string', state: 'Async feedback' },
    { key: 'failureAnnouncement', type: 'string', state: 'Async feedback' },
    { key: 'warningTitle', type: 'string', state: 'Default content and accessible names' },
    { key: 'warningText', type: 'string', state: 'Default content and accessible names' },
    { key: 'closeLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'copiedAnnouncementFor', type: '(label: string, copied: string) => string', state: 'Async feedback' },
  ] satisfies Array<{ key: keyof CredentialDisclosureDialogLabels; type: string; state: string }>,
  uses: ['Dialog', 'SecretField', 'CodeBlock', 'CopyButton', 'Alert', 'LiveAnnouncer', 'Button'],
};
