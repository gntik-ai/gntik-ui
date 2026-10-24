import type { BlockMeta } from '../../meta';
import type { DescriptionListCardLabels } from './DescriptionListCard';

export const meta: BlockMeta = {
  name: 'Description list card',
  family: 'data-display',
  status: 'beta',
  description:
    'Key–value detail card with mono, status and rich values, copy-to-clipboard buttons and an Edit action. Optional labels?: Partial<DescriptionListCardLabels> overrides each built-in label. Explicit content props win over labels, then I18nProvider (en/es); no provider keeps English. Imported fixtures and machine data stay unchanged. See the Catalog labels live preview. wrap?: boolean (default false) shows full values and breaks long unbroken strings. columns?: 1 | 2 | 3 (default 1) stacks terms above values in two or three columns from sm, with one column below sm; items fill contiguous top-to-bottom chunks of ceil(item count / columns), and dividers stay within each column. Defaults preserve the original single-column rows. See the Spanish live preview for wrapping and both column layouts. Copy actions await the clipboard write; denied or unavailable access shows common.copyFailed (overridden by labels.copyFailed), and only a successful write calls onCopy. Both results reset after 1500ms. See the Catalog labels live preview.',
  labels: [
    { key: 'title', type: 'string', state: 'Card heading; title prop wins' },
    { key: 'description', type: 'string', state: 'Card description; description prop wins' },
    { key: 'edit', type: 'string', state: 'Edit button; editLabel prop wins' },
    { key: 'copy', type: '(label: string) => string', state: 'Copy button name; original item label' },
    { key: 'copied', type: '(label: string) => string', state: 'Copy button name after copying; original item label' },
    { key: 'copyFailed', type: 'string', state: 'Copy button name and polite announcement after a failed write' },
    { key: 'copiedToClipboard', type: 'string', state: 'Polite copy announcement' },
  ] satisfies Array<{ key: keyof DescriptionListCardLabels; type: string; state: string }>,
  uses: ['Card', 'Button', 'IconButton', 'StatusTag'],
};
