import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Plan card',
  family: 'billing',
  status: 'beta',
  description: 'Current plan header: name, status, price per cycle with a monthly/annual toggle, renewal date, included features and upgrade/manage actions.',
  uses: ['Card', 'Badge', 'Button', 'ToggleGroup', 'Toggle'],
};
