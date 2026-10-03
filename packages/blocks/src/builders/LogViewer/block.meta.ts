import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Log viewer',
  family: 'builders',
  status: 'beta',
  description:
    'Windowed log stream (role="log"): level filter, search with highlighted matches, follow-tail and per-line copy. Renders only the visible rows.',
  uses: ['ToggleGroup', 'Toggle', 'Input', 'Switch', 'IconButton'],
};
