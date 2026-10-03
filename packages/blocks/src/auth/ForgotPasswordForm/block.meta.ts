import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Forgot password form',
  family: 'auth',
  status: 'stable',
  description: 'Requests a password reset link by email, then shows a "check your email" state with resend.',
  uses: ['Field', 'Input', 'Button', 'Alert', 'Link'],
};
