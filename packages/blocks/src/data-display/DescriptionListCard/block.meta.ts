import type { BlockMeta } from '../../meta';
import type { DescriptionListCardLabels } from './DescriptionListCard';

export const meta: BlockMeta = {
  name: 'Description list card',
  family: 'data-display',
  status: 'beta',
  description:
    'Key–value detail card with mono, status and rich values, copy-to-clipboard buttons and an Edit action. Optional labels?: Partial<DescriptionListCardLabels> overrides each built-in label. Explicit content props win over labels, then I18nProvider (en/es); no provider keeps English. Imported fixtures and machine data stay unchanged. See the Catalog labels live preview.',
  labels: [
    { key: 'title', type: 'string', state: 'Card heading; title prop wins' },
    { key: 'description', type: 'string', state: 'Card description; description prop wins' },
    { key: 'edit', type: 'string', state: 'Edit button; editLabel prop wins' },
    { key: 'copy', type: '(label: string) => string', state: 'Copy button name; original item label' },
    { key: 'copied', type: '(label: string) => string', state: 'Copy button name after copying; original item label' },
    { key: 'copiedToClipboard', type: 'string', state: 'Polite copy announcement' },
  ] satisfies Array<{ key: keyof DescriptionListCardLabels; type: string; state: string }>,
  uses: ['Card', 'Button', 'IconButton', 'StatusTag'],
};
