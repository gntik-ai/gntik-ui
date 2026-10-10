import type { CredentialDisclosure } from './CredentialDisclosureDialog';

/** Synthetic values only: never use live credentials in previews or tests. */
export const storedDisclosure: CredentialDisclosure = {
  variant: 'stored',
  credentialId: 'cred_demo_01',
  expiresAt: 'January 1, 2030',
  secret: 'synthetic_stored_secret_for_demo_only',
};
export const freshDisclosure: CredentialDisclosure = {
  ...storedDisclosure,
  variant: 'fresh',
  secret: 'synthetic_fresh_secret_for_demo_only',
};
