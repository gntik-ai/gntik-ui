import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Trace waterfall',
  family: 'ai',
  status: 'beta',
  description:
    'Span tree of a trace with indentation and duration bars positioned on a shared time axis; spans expand and collapse; the list is one tab stop with arrow-key navigation (←/→ collapse and expand), selection is controlled or uncontrolled, the details pane is optional or custom, and running spans show an in-progress bar (pulse stops under reduced motion) with a visible "running" label.',
  uses: ['Badge', 'StatusTag'],
};
