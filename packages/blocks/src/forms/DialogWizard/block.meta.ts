import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Dialog wizard',
  family: 'forms',
  status: 'beta',
  description: 'Modal variant of create-wizard for create flows over their parent page, without a route change. Defaults to dialog size (fullscreen on mobile); size="fullscreen" fills every viewport. Consumer-controlled step state survives closing. Use the create-wizard page template for a dedicated page flow, or WizardLayout mode="overlay" for a fullscreen flow. Supply all labels, pendingLabel and stepAnnouncement from your own i18n; stepError accepts ValidationSummary and reviewStep accepts DescriptionListCard.',
  uses: ['WizardLayout', 'Dialog', 'Stepper', 'Button'],
};
