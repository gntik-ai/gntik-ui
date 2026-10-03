import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Sign-in form',
  family: 'auth',
  status: 'stable',
  description: 'Email and password sign-in with remember me, forgot-password link, SSO slot, error alert and loading state.',
  uses: ['Field', 'Input', 'PasswordInput', 'Checkbox', 'Button', 'Alert', 'Link', 'SsoButtons'],
};
