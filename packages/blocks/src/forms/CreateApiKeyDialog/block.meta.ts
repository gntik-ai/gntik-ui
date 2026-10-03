import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Create API key dialog',
  family: 'forms',
  status: 'stable',
  description: 'Two-step dialog: name, scopes and expiry, then the secret shown once in a copyable CodeBlock with a warning.',
  uses: ['Dialog', 'Field', 'Input', 'CheckboxGroup', 'Checkbox', 'Select', 'CodeBlock', 'Alert', 'Button'],
};
