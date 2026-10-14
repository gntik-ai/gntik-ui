import type { BlockMeta } from '../../meta';
import type { FilterBarLabels } from './FilterBar';

export const meta: BlockMeta = {
  name: 'Filter bar',
  family: 'tables',
  status: 'beta',
  description:
    'Search Input, saved views Select, an Add filter Menu with multi-select per field, removable filter chips and Clear all.',
  labels: [
    { key: 'searchLandmark', type: 'string', state: 'Always: search landmark name' },
    { key: 'searchLabel', type: 'string', state: 'Always: search input accessible name' },
    { key: 'searchPlaceholder', type: 'string', state: 'Always: search input placeholder' },
    { key: 'savedViewLabel', type: 'string', state: 'When views exist: Select accessible name' },
    { key: 'savedViewPlaceholder', type: 'string', state: 'When no view selected: Select placeholder' },
    { key: 'addFilter', type: 'string', state: 'Always: Add filter trigger text and name' },
    { key: 'activeFilters', type: 'string', state: 'When filters or search exist: active-filters list name' },
    { key: 'filters', type: 'string', state: 'When filters or search exist: chip section heading' },
    { key: 'clearAll', type: 'string', state: 'When filters or search exist: clear button text and name' },
    {
      key: 'removeFilter',
      type: '(field: string, value: string) => string',
      state: 'When chip exists: remove button name; field and value are caller content',
    },
    {
      key: 'resultCount',
      type: '(count: number) => string',
      state: 'When resultCount supplied: visible count and polite live region',
    },
  ] satisfies Array<{ key: keyof FilterBarLabels; type: string; state: string }>,
  uses: ['Input', 'SimpleSelect', 'Menu', 'MenuCheckboxItem', 'Token', 'Button'],
};
