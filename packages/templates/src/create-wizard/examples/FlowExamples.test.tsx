import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pending from './UncontrolledPending';
import Success from './UncontrolledSuccess';
import ErrorExample from './UncontrolledError';
import ControlledIdle from './ControlledIdle';
import ControlledSubmitting from './ControlledSubmitting';
import ControlledSuccess from './ControlledSuccess';
import ControlledError from './ControlledError';
import { expectNoAxeViolations } from '../../test/a11y';

it.each([
  ['pending', Pending],
  ['success', Success],
  ['error', ErrorExample],
  ['idle', ControlledIdle],
  ['submitting', ControlledSubmitting],
  ['success', ControlledSuccess],
  ['error', ControlledError],
] as const)('walks and renders the %s example without accessibility violations', async (state, Example) => {
  const user = userEvent.setup();
  const { container } = render(<Example />);
  if (screen.queryByRole('button', { name: 'Next' })) {
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Create resource' }));
  }
  if (state === 'pending' || state === 'submitting')
    expect(screen.getByRole('button', { name: 'Creating resource…' })).toHaveAttribute('aria-disabled', 'true');
  if (state === 'success') expect(await screen.findByRole('heading', { name: 'Resource created' })).toBeInTheDocument();
  if (state === 'error')
    expect(await screen.findByText('Could not create the resource. Try again.', { selector: 'p' })).toBeInTheDocument();
  await expectNoAxeViolations(container);
});

it('resets a controlled example to idle when exit is confirmed', async () => {
  const user = userEvent.setup();
  render(<ControlledSubmitting />);
  await user.click(screen.getByRole('button', { name: 'Exit' }));
  await user.click(await screen.findByRole('button', { name: 'Leave' }));
  const next = await screen.findByRole('button', { name: 'Next' });
  expect(next).not.toHaveAttribute('aria-disabled', 'true');
  await user.click(next);
  expect(screen.getByRole('heading', { name: 'Review resource' })).toBeInTheDocument();
});

it('passes through controlled submitting before announcing completion', async () => {
  const user = userEvent.setup();
  const { container } = render(<ControlledIdle />);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Create resource' }));
  await screen.findByRole('heading', { name: 'Resource created' });
  await waitFor(() =>
    expect(container.querySelector('[data-live-announcer="polite"]')).toHaveTextContent('Resource created'),
  );
});
