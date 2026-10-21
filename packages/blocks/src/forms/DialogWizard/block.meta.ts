import type { BlockMeta } from '../../meta';
import type { DialogWizardLabels } from './DialogWizard';

export const meta: BlockMeta = {
  name: 'Dialog wizard',
  family: 'forms',
  status: 'beta',
  description:
    'Modal variant of create-wizard for create flows over their parent page, without a route change. Defaults to dialog size (fullscreen on mobile); size="fullscreen" fills every viewport. Consumer-controlled step state survives closing. Use the create-wizard page template for a dedicated page flow, or WizardLayout mode="overlay" for a fullscreen flow. Supply all labels, pendingLabel and stepAnnouncement from your own i18n; stepError accepts ValidationSummary and reviewStep accepts DescriptionListCard. Optional labels?: Partial<DialogWizardLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=dialog-wizard--labels.',
  labels: [
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'details', type: 'string', state: 'Default content and accessible names' },
    { key: 'review', type: 'string', state: 'Default content and accessible names' },
  ] satisfies Array<{ key: keyof DialogWizardLabels; type: string; state: string }>,
  uses: ['WizardLayout', 'Dialog', 'Stepper', 'Button'],
};
