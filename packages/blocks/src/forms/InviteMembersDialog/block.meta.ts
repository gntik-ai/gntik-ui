import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Invite members dialog',
  family: 'forms',
  status: 'stable',
  description: 'Dialog to invite people by email (validated chips) with a role and an optional message; submits with a loading state.',
  uses: ['Dialog', 'TokenInput', 'Select', 'Textarea', 'Field', 'Button', 'Alert'],
};
