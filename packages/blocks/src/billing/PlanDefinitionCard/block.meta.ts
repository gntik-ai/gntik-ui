import type { BlockMeta } from '../../meta';

/** Catalogue contract read by get_block and llms-full.txt. */
export const documentation = {
  pattern:
    'Heading (titleAs h2/h3/h4), visible lifecycle Badge, Capabilities list with Enabled/Disabled text, quota/tenant/update description list, and consumer native actions. No price, billing cycle, renewal or built-in upgrade action. Axe coverage in dark, light and high_contrast at compact and full densities.',
  keyboard: [
    ['Tab / Shift+Tab', 'Move between consumer-supplied buttons and links.'],
    ['Enter', 'Activate a focused button or link.'],
    ['Space', 'Activate a focused button.'],
  ],
  tokens: ['card', 'foreground', 'muted-foreground', 'border', 'focus-ring'],
  props: [
    [
      'plan',
      'PlanDefinition: name, slug, status, tenantCount and updatedAt required; optional description, capabilities (Record<string, boolean>) and quotas (Record<string, string | number>). Omitted plan uses the neutral definition fixture.',
    ],
    ['density', 'compact | full (default); both show all supplied definition data.'],
    [
      'statusLabels',
      'Partial<Record<draft | active | deprecated | archived, string>> overrides English lifecycle labels.',
    ],
    ['actions', 'ReactNode slot of kit Buttons or native links; absent by default.'],
    ['titleAs / className', 'h2 | h3 (default) | h4; additional token-backed classes.'],
  ],
  examples: ['compact', 'full'],
};

export const meta: BlockMeta = {
  name: 'Plan definition card',
  family: 'billing',
  status: 'beta',
  description: [
    'Administrative plan definition without billing fields: name, slug, optional description, labelled draft/active/deprecated/archived status, enabled/disabled capabilities, quotas, assigned tenants and formatted update date. Compact and full densities, consumer action slots and statusLabels overrides. See README.md for props, ARIA, keyboard and examples.',
    '',
    '| Prop | Contract |',
    '| --- | --- |',
    ...documentation.props.map(([prop, contract]) => `| ${prop} | ${contract?.replaceAll('|', '\\|')} |`),
    '',
    'Examples:',
    ...documentation.examples.map(
      (example) => `- [${example}](/preview.html?kind=block&id=plan-definition-card--${example})`,
    ),
  ].join('\n'),
  uses: ['Card', 'Badge', 'Button'],
};
