import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import GettingStartedPage from './Page';

describe('GettingStartedPage', () => {
  it('renders the checklist, progress and docs links', { timeout: 15000 }, async () => {
    const { container } = render(<GettingStartedPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Get started' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Setup progress' })).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByRole('link', { name: 'Quickstart' })).toHaveAttribute('href', '#quickstart');
    await expectNoAxeViolations(container);
  });

  it('checks the remaining steps and shows the completion message', { timeout: 15000 }, async () => {
    const onDoneChange = vi.fn();
    const { container } = render(<GettingStartedPage onDoneChange={onDoneChange} />);
    for (const name of ['Ship your first deployment', 'Invite your team', 'Add a payment method']) {
      await userEvent.click(screen.getByRole('checkbox', { name }));
    }
    expect(onDoneChange).toHaveBeenLastCalledWith(['workspace', 'project', 'deploy', 'invite', 'billing']);
    expect(screen.getByRole('progressbar', { name: 'Setup progress' })).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('You’re all set')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
