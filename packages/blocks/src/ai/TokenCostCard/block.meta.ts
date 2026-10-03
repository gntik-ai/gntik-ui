import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Token cost card',
  family: 'ai',
  status: 'beta',
  description: 'Input and output token counts, their split, total cost and a budget meter, with a period switch.',
  uses: ['Card', 'ToggleGroup', 'Toggle', 'Meter'],
};
