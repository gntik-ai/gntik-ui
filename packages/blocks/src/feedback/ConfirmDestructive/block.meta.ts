import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Confirm destructive',
  family: 'feedback',
  status: 'beta',
  description:
    'AlertDialog for irreversible actions with exact typed-name and optional canConfirm gating, extra form fields, typed failure states, guarded retry and focus return. See the plain deletion and secret revocation examples.',
  uses: ['AlertDialog', 'Button', 'Field', 'Input', 'EmptyState'],
};
