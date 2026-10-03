import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import StatusMaintenancePage from './Page';

describe('StatusMaintenancePage', () => {
  it('renders the maintenance message, banner and status link', async () => {
    render(<StatusMaintenancePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'We’ll be back shortly' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Maintenance in progress.');
    expect(screen.getByRole('link', { name: 'Subscribe to updates' })).toHaveAttribute('href', '/status/subscribe');
    expect(screen.getByRole('button', { name: 'View status page' })).toHaveAttribute('href', '/status');
    await expectNoAxeViolations();
  });

  it('shows a note when Check again finds the service still down', async () => {
    const onCheckAgain = vi.fn(() => false);
    render(<StatusMaintenancePage onCheckAgain={onCheckAgain} />);
    await userEvent.click(screen.getByRole('button', { name: 'Check again' }));
    expect(onCheckAgain).toHaveBeenCalledOnce();
    expect(await screen.findByText('Still in maintenance. Try again in a few minutes.')).toBeInTheDocument();
  });
});
