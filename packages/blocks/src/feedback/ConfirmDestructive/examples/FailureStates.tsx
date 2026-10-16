import type { ConfirmDestructiveFailure } from '../ConfirmDestructive';
import SecretRevocation from './SecretRevocation';

// Consumers map HTTP and fetch failures; the dialog never infers a state from a status.
const server: ConfirmDestructiveFailure = {
  kind: 'server',
  title: 'Could not revoke version',
  message: 'Try again after checking the service.',
  status: 500,
  requestId: 'req_revoke_7',
};
const network: ConfirmDestructiveFailure = {
  kind: 'network',
  title: 'Connection lost',
  message: 'Check your connection and try again.',
};
const noAccess: ConfirmDestructiveFailure = {
  kind: 'no-access',
  title: 'You cannot revoke this version',
  description: 'Ask an administrator to review your permissions.',
};
const notFound: ConfirmDestructiveFailure = {
  kind: 'not-found',
  title: 'Version not found',
  description: 'This version has already been removed.',
};

export function ServerFailure() {
  return <SecretRevocation onConfirm={() => Promise.reject(server)} />;
}
export function NetworkFailure() {
  return <SecretRevocation onConfirm={() => Promise.reject(network)} />;
}
export function NoAccessFailure() {
  return <SecretRevocation onConfirm={() => Promise.reject(noAccess)} />;
}
export function NotFoundFailure() {
  return <SecretRevocation onConfirm={() => Promise.reject(notFound)} />;
}
