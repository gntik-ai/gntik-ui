import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Sign in (card)',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: 'Centred card sign-in: email and password form with remember me and forgot-password link, legal footer, no single sign-on.',
  layout: 'AuthLayout',
  blocks: ['sign-in-form'],
};
