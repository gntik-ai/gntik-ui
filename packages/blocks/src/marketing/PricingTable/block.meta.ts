import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Pricing table',
  family: 'marketing',
  status: 'beta',
  description: 'Pricing tiers with a monthly/annual toggle, a highlighted tier (primary border, no fill), price per cycle, CTA and feature checklist.',
  uses: ['ToggleGroup', 'Toggle', 'Badge', 'Button', 'RadioGroup', 'Radio'],
};
