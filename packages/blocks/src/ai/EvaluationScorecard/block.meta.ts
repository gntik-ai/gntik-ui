import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Evaluation scorecard',
  family: 'ai',
  status: 'beta',
  description:
    'Evaluation run as a datasets × metrics table: pass rate, scores against thresholds, deltas vs the baseline and flagged regressions, with a regressions-only filter.',
  uses: ['Table', 'Badge', 'ToggleGroup', 'Toggle'],
};
