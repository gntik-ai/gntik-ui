import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Sign in',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: 'Split sign-in: brand panel with a short value pitch, email and password form, forgot-password link and single sign-on options.',
  layout: 'AuthLayout',
  blocks: ['sign-in-form', 'sso-buttons'],
};
