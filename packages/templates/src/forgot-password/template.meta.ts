import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Forgot password',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: 'Centred card password recovery: request a reset link by email, then a check-your-inbox state with resend and a way back to sign in.',
  layout: 'AuthLayout',
  blocks: ['forgot-password-form'],
};
