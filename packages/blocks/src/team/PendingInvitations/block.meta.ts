import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Pending invitations',
  family: 'team',
  status: 'stable',
  description: 'List of pending invitations with role, sender, age and expiry, and resend / revoke actions.',
  uses: ['Badge', 'StatusTag', 'Timestamp', 'Button', 'EmptyState'],
};
