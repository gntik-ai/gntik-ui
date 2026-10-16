import type { CreateWizardFlowLabels } from '../Flow';

/** A page namespace: every template-owned string is supplied here. */
export const flowLabels: CreateWizardFlowLabels = {
  title: 'Create resource',
  exit: 'Exit',
  cancel: 'Cancel',
  back: 'Back',
  next: 'Next',
  finish: 'Create resource',
  pending: 'Creating resource…',
  review: 'Review',
  reviewTitle: 'Review resource',
  edit: (label) => `Edit ${label}`,
  emptyValue: 'Not provided',
  success: () => 'Resource created',
  errorFallback: 'Could not create the resource. Try again.',
  openResource: 'Open resource',
  exitTitle: 'Leave this flow?',
  exitDescription: 'Your answers will be discarded.',
  exitConfirm: 'Leave',
  exitCancel: 'Stay',
  steps: 'Creation progress',
  stepsSummary: 'Creation progress summary',
  skipLink: 'Skip to step',
  stepStatusText: { complete: 'completed', current: 'current', upcoming: 'upcoming', error: 'error' },
  formatStepCount: (position, total) => `Step ${position} of ${total}`,
  stepAnnouncement: ({ position, total, label }) => `Step ${position} of ${total}: ${label}`,
};
