import type { BlockMeta } from '../../meta';
import type { ValidationSummaryLabels } from './ValidationSummary';

export const meta: BlockMeta = {
  name: 'Validation summary',
  family: 'forms',
  status: 'stable',
  description:
    'Error summary that lists every problem with a link to its field and takes focus after a failed submit. Optional labels?: Partial<ValidationSummaryLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=validation-summary--labels.',
  labels: [
    { key: 'title', type: '(count: number) => string', state: 'Default content and accessible names' },
  ] satisfies Array<{ key: keyof ValidationSummaryLabels; type: string; state: string }>,
  uses: ['Alert', 'Link'],
};
