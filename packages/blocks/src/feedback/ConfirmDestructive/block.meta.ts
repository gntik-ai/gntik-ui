import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Confirm destructive',
  family: 'feedback',
  status: 'beta',
  description: 'AlertDialog for irreversible actions that requires typing the resource name, with async confirm and error display.',
  uses: ['AlertDialog', 'Button', 'Field', 'Input'],
};
