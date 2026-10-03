import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Trace waterfall',
  family: 'ai',
  status: 'beta',
  description:
    'Span tree of a trace with indentation and duration bars positioned on a shared time axis; spans expand and collapse, and the selected span shows its details.',
  uses: ['Badge', 'StatusTag'],
};
