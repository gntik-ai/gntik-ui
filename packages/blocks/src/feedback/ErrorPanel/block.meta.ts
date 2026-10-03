import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Error panel',
  family: 'feedback',
  status: 'beta',
  description: 'Error summary with status code, copyable request id, retry with loading state and a technical-details disclosure.',
  uses: ['Button', 'IconButton', 'Collapsible'],
};
