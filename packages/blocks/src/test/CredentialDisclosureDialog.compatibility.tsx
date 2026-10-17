import {
  CredentialDisclosureDialog,
  type CredentialDisclosureDialogProps,
} from '../forms/CredentialDisclosureDialog/CredentialDisclosureDialog';
import { storedDisclosure } from '../forms/CredentialDisclosureDialog/fixtures';

/** Compile-only consumer fixture for every pre-amendment prop. */
export function LegacyCredentialDisclosure() {
  const props: CredentialDisclosureDialogProps = {
    disclosure: storedDisclosure,
    onClose: () => {},
    resolveReturnFocus: () => null,
    fallbackFocus: () => null,
    title: 'Credential',
    description: 'Keep this value safe.',
    credentialIdLabel: 'Identifier',
    expiryLabel: 'Expiry',
    secretLabel: 'Secret',
    showLabel: 'Show',
    hideLabel: 'Hide',
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
    successAnnouncement: 'Copied safely',
    failureAnnouncement: 'Copy manually',
    warningTitle: 'Save this value',
    warningText: 'Shown once',
    closeLabel: 'Close',
  };
  return <CredentialDisclosureDialog {...props} />;
}
