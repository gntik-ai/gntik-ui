import type { BlockMeta } from '../../meta';
import type { FormSectionLabels } from './FormSection';

export const meta: BlockMeta = {
  name: 'Form section',
  family: 'forms',
  status: 'stable',
  description:
    'Two-column settings section: title and help on the left, fields on the right; stacks on small screens. Optional labels?: Partial<FormSectionLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=form-section--labels.',
  labels: [
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: 'string', state: 'Default content and accessible names' },
  ] satisfies Array<{ key: keyof FormSectionLabels; type: string; state: string }>,
  uses: ['Field', 'Input', 'Textarea'],
};
