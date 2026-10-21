import type { BlockMeta } from '../../meta';
import type { DateRangeFilterLabels } from './DateRangeFilter';

export const meta: BlockMeta = {
  name: 'Date range filter',
  family: 'forms',
  status: 'stable',
  description:
    'Compact date range picker for toolbars: small trigger with short dates, presets and a clear button. Optional labels?: Partial<DateRangeFilterLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=date-range-filter--labels.',
  labels: [
    { key: 'label', type: 'string', state: 'Default content and accessible names' },
    { key: 'placeholder', type: 'string', state: 'Default content and accessible names' },
    { key: 'clear', type: '(label: string) => string', state: 'Default content and accessible names' },
  ] satisfies Array<{ key: keyof DateRangeFilterLabels; type: string; state: string }>,
  uses: ['DateRangePicker', 'IconButton'],
};
