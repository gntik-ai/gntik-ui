import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'MFA challenge',
  family: 'auth',
  status: 'stable',
  description: 'Second-factor step with a one-time code (auto-submit), a backup-code mode and resend with a countdown.',
  uses: ['OtpInput', 'Field', 'Input', 'Button', 'Alert'],
};
