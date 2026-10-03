import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Reset password form',
  family: 'auth',
  status: 'stable',
  description: 'New password with a strength meter and a confirmation field with mismatch validation, then a success state.',
  uses: ['Field', 'PasswordInput', 'Button', 'Alert'],
};
