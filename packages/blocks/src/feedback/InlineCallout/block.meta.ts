import type { BlockMeta } from '../../meta';
import type { InlineCalloutLabels } from './InlineCallout';

export const meta: BlockMeta = {
  name: 'Inline callout',
  family: 'feedback',
  status: 'beta',
  description:
    'Alert-based in-content callout with a tone, title, body, action buttons or links and optional dismiss. Optional labels?: Partial<InlineCalloutLabels> overrides each built-in label. Explicit content props win over labels, then I18nProvider (en/es); no provider keeps English. Imported fixtures and machine data stay unchanged. See the Catalog labels live preview.',
  labels: [
    { key: 'title', type: 'string', state: 'Callout title; explicit title prop wins, including null' },
    { key: 'description', type: 'string', state: 'Callout body; explicit description prop wins, including null' },
    { key: 'upgrade', type: 'string', state: 'Default primary action; explicit actions win' },
    { key: 'viewUsage', type: 'string', state: 'Default usage link; explicit actions win' },
  ] satisfies Array<{ key: keyof InlineCalloutLabels; type: string; state: string }>,
  uses: ['Alert', 'Button', 'Link'],
};
