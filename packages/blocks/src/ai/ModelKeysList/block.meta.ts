import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Model keys list',
  family: 'ai',
  status: 'beta',
  description:
    'Model provider keys with masked secrets and status: test the connection (spinner while it runs, result announced) and revoke behind a confirmation dialog.',
  uses: ['Card', 'StatusTag', 'Button', 'Spinner', 'AlertDialog', 'EmptyState'],
};
