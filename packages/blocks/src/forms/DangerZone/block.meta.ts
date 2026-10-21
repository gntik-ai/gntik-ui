import type { BlockMeta } from '../../meta';
import type { DangerZoneLabels } from './DangerZone';

export const meta: BlockMeta = {
  name: 'Danger zone',
  family: 'forms',
  status: 'stable',
  description:
    'Bordered destructive section whose actions open an alert dialog that can require typing the resource name. Optional labels?: Partial<DangerZoneLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=danger-zone--labels.',
  labels: [
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: 'string', state: 'Default content and accessible names' },
    { key: 'confirmationTitle', type: '(title: string) => string', state: 'Destructive confirmation dialog' },
    { key: 'confirmPrompt', type: '(text: ReactNode) => ReactNode', state: 'Destructive confirmation dialog' },
    { key: 'cancel', type: 'string', state: 'Destructive confirmation dialog' },
    { key: 'fallbackError', type: 'string', state: 'Destructive confirmation dialog' },
  ] satisfies Array<{ key: keyof DangerZoneLabels; type: string; state: string }>,
  uses: ['Button', 'AlertDialog', 'Field', 'Input', 'Alert'],
};
