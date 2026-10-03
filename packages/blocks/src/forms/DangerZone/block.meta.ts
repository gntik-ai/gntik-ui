import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Danger zone',
  family: 'forms',
  status: 'stable',
  description: 'Bordered destructive section whose actions open an alert dialog that can require typing the resource name.',
  uses: ['Button', 'AlertDialog', 'Field', 'Input', 'Alert'],
};
