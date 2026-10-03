import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Single sign-on',
  family: 'Auth',
  priority: 'P2',
  status: 'beta',
  description: 'Centred card SSO entry: work email lookup, then a "Redirecting to your identity provider" state with cancel and a password fallback.',
  layout: 'AuthLayout',
  blocks: [],
};
