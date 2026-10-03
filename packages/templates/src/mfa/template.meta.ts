import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Two-step verification',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: 'Centred card second-factor step: one-time code that auto-submits, backup-code fallback, resend with countdown and a way back to sign in.',
  layout: 'AuthLayout',
  blocks: ['mfa-challenge'],
};
