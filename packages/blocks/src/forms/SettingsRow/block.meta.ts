import type { BlockMeta } from '../../meta';
import type { SettingsRowLabels } from './SettingsRow';

export const meta: BlockMeta = {
  name: 'Settings row',
  family: 'forms',
  status: 'stable',
  description:
    'A setting with its label and description on the left and a control (Switch by default) on the right. Optional labels?: Partial<SettingsRowLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=settings-row--labels.',
  labels: [
    { key: 'label', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: 'string', state: 'Default content and accessible names' },
  ] satisfies Array<{ key: keyof SettingsRowLabels; type: string; state: string }>,
  uses: ['Switch'],
};
