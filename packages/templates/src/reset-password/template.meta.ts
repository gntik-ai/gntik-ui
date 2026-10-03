import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Reset password',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: 'Centred card new-password step: password with a strength meter and confirmation, then a success state that continues to sign in.',
  layout: 'AuthLayout',
  blocks: ['reset-password-form'],
};
