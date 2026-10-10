import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DescriptionListCard } from '../../data-display/DescriptionListCard/DescriptionListCard';
import { ValidationSummary } from '../ValidationSummary/ValidationSummary';
import { DialogWizard } from './DialogWizard';
import { expectNoAxeViolations } from '../../test/a11y';

describe('DialogWizard', () => {
  it('uses consumer labels and shows validation and review slots with the shared step footer', async () => {
    const user = userEvent.setup();
    const props = { open: true, title: 'Provision database', description: 'Configure storage',
      steps: [{ label: 'Engine' }, { label: 'Check answers' }],
      cancelLabel: 'Abandon', backLabel: 'Previous', nextLabel: 'Continue', finishLabel: 'Provision', exitLabel: 'Close flow',
      stepsLabel: 'Stages', stepsSummaryLabel: 'Stage count', pendingLabel: 'Provisioning',
      stepAnnouncement: ({ position }: { position: number }) => `Stage ${position}` };
    const { rerender } = render(<DialogWizard {...props} current={0} nextDisabled stepError={
      <ValidationSummary title="Fix the engine" errors={[{ fieldId: 'engine', message: 'Choose an engine' }]} />
    }><input id="engine" aria-label="Engine choice" /></DialogWizard>);
    expect(await screen.findByRole('dialog', { name: 'Provision database' })).toHaveAccessibleDescription('Configure storage');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByText('Fix the engine')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abandon' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Choose an engine' }));
    expect(screen.getByRole('textbox')).toHaveFocus();
    const onFinish = vi.fn();
    rerender(<DialogWizard {...props} current={1} onFinish={onFinish} reviewStep={
      <DescriptionListCard title="Your answers" description="Review storage" items={[{ id: 'engine', label: 'Engine', value: 'Standard' }]} />
    } />);
    expect(screen.getByText('Your answers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Provision' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  for (const theme of ['dark', 'light', 'high_contrast']) {
    for (const size of ['dialog', 'fullscreen'] as const) {
      it.each([1, 2])(`has no axe violations in ${theme}, ${size}, step %s`, async (current) => {
        document.documentElement.className = theme === 'light' ? '' : theme;
        render(<DialogWizard open title="Create resource" description="Configure storage" size={size}
          steps={[{ label: 'Details' }, { label: 'Configuration' }, { label: 'Review' }]} current={current}
          reviewStep={<DescriptionListCard title="Answers" description="Review your choices" items={[{ id: 'name', label: 'Name', value: 'Resource' }]} />}>
          <h2>Configuration</h2><input aria-label="Region" />
        </DialogWizard>);
        await expectNoAxeViolations(await screen.findByRole('dialog'));
      });
    }
  }
});
