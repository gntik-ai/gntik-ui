import type { BlockMeta } from '../../meta';
import type { SsoButtonsLabels } from './SsoButtons';

export const meta: BlockMeta = {
  name: 'SSO buttons',
  family: 'auth',
  status: 'stable',
  description:
    'Neutral "Continue with …" provider buttons with lucide icons and a per-provider loading state. Optional labels?: Partial<SsoButtonsLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=sso-buttons--labels.',
  labels: [{ key: 'label', type: 'string', state: 'Default content and accessible names' }] satisfies Array<{
    key: keyof SsoButtonsLabels;
    type: string;
    state: string;
  }>,
  uses: ['Button'],
};
