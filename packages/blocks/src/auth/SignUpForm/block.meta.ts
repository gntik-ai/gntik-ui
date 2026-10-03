import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Sign-up form',
  family: 'auth',
  status: 'stable',
  description: 'Account creation with name, email, a password strength meter and a required terms checkbox.',
  uses: ['Field', 'Input', 'PasswordInput', 'Checkbox', 'Button', 'Alert', 'Link', 'SsoButtons'],
};
