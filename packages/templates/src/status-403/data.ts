import { noAccessSample } from '@gntik-ai/blocks';

/** Neutral fixtures for the 403 page (resource and owner reuse the NoAccessEmpty sample). */
export const forbiddenContent = {
  code: '403 · Forbidden',
  resource: noAccessSample.resource,
  owner: noAccessSample.owner,
  homeLabel: 'Go to dashboard',
  homeHref: '/',
  signedInAs: 'dana@example.com',
  switchAccountLabel: 'Switch account',
  switchAccountHref: '/sign-in',
};
