import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardLayout } from './WizardLayout';

it('supports display-only progress and caller status and position text', () => {
  render(
    <WizardLayout
      steps={[{ label: 'First' }, { label: 'Second' }]}
      current={1}
      onStepChange={vi.fn()}
      stepsInteractive={false}
      stepStatusText={{ complete: 'Caller complete', current: 'Caller current' }}
      formatStepCount={(step, total) => `Caller ${step}/${total}`}
    />,
  );
  const progress = screen.getByRole('navigation', { name: 'Progress' });
  expect(within(progress).queryByRole('button')).not.toBeInTheDocument();
  expect(progress).toHaveTextContent('Caller complete');
  expect(progress).toHaveTextContent('Caller current');
  expect(screen.getByRole('navigation', { name: 'Progress summary' })).toHaveTextContent('Caller 2/2');
});

it('keeps a locked Back focusable and prevents activation', async () => {
  const user = userEvent.setup();
  const onStepChange = vi.fn();
  render(
    <WizardLayout
      steps={[{ label: 'First' }, { label: 'Second' }]}
      current={1}
      backDisabled
      onStepChange={onStepChange}
    />,
  );
  const back = screen.getByRole('button', { name: 'Back' });
  expect(back).not.toBeDisabled();
  expect(back).toHaveAttribute('aria-disabled', 'true');
  back.focus();
  await user.keyboard('{Enter} ');
  expect(back).toHaveFocus();
  expect(onStepChange).not.toHaveBeenCalled();
});
