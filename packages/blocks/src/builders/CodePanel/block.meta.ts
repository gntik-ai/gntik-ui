import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Code panel',
  family: 'builders',
  status: 'beta',
  description:
    'Multi-file code panel: file tabs, a lazily loaded Monaco editor or diff against the previous version, and a problems list that jumps to the reported line.',
  uses: ['Tabs', 'ToggleGroup', 'Toggle', 'CodeEditor', 'DiffEditor'],
};
