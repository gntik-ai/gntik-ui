import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Sign up',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: 'Split sign-up: brand panel with the value pitch, name, work email and password with a strength meter, terms consent and single sign-on.',
  layout: 'AuthLayout',
  blocks: ['sign-up-form', 'sso-buttons'],
};
