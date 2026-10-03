import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import Status403Page from './Page';

describe('Status403Page', () => {
  it('renders the forbidden message with landmarks', async () => {
    render(<Status403Page />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'You don’t have access to Billing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to dashboard' })).toHaveAttribute('href', '/');
    await expectNoAxeViolations();
  });

  it('requests access and moves to the requested state', async () => {
    const onRequestAccess = vi.fn(() => Promise.resolve());
    render(<Status403Page resource="Audit log" onRequestAccess={onRequestAccess} />);
    await userEvent.click(screen.getByRole('button', { name: 'Request access' }));
    expect(onRequestAccess).toHaveBeenCalledOnce();
    expect(await screen.findByRole('button', { name: 'Access requested' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Access request sent');
  });
});
