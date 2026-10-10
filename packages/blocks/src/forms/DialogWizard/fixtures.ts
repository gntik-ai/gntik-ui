/** Example data only; consumers own every label and all step state. */
export const dialogWizardSteps = [{ label: 'Details' }, { label: 'Configuration' }, { label: 'Review' }];
export const dialogWizardCopy = {
  title: 'Create resource', description: 'Configure and review a new resource.',
  exitLabel: 'Exit', cancelLabel: 'Cancel', backLabel: 'Back', nextLabel: 'Next', finishLabel: 'Create resource',
  pendingLabel: 'Creating resource…', stepsLabel: 'Setup progress', stepsSummaryLabel: 'Setup progress summary',
  exitTitle: 'Leave this setup?', exitDescription: 'Your answers stay available when you reopen the flow.',
  exitConfirmLabel: 'Leave', exitCancelLabel: 'Stay',
  stepAnnouncement: ({ position, total, label }: { position: number; total: number; label: unknown }) => `Step ${position} of ${total}: ${label}`,
};
