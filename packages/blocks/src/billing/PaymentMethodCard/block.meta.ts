import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Payment method card',
  family: 'billing',
  status: 'beta',
  description: 'The card on file as text (brand, last four digits, expiry, holder) with default/expiry badges and update/remove actions; no card artwork.',
  uses: ['Card', 'Badge', 'Button'],
};
