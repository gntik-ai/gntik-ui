import type { BlockMeta } from '../../meta';
import { labelDocs } from './labels.doc';

export const meta: BlockMeta = {
  name: 'Filter bar',
  labels: labelDocs.map(([key, type, state]) => ({ key, type, state })),
  family: 'tables',
  status: 'beta',
  description:
    'Search Input, saved views Select, an Add filter Menu with multi-select per field, removable filter chips and Clear all.',
  uses: ['Input', 'SimpleSelect', 'Menu', 'MenuCheckboxItem', 'Token', 'Button'],
};
