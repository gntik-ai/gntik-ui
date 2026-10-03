import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Prompt editor',
  family: 'ai',
  status: 'beta',
  description:
    'System and user prompt editors that detect {{variables}} as chips with value inputs, plus temperature and max-token parameters and a Run action. Variable values can be controlled (variables, onVariablesChange).',
  uses: ['Textarea', 'Token', 'Field', 'Input', 'Slider', 'Button'],
};
