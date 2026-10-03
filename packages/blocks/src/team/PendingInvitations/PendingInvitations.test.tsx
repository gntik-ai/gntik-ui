import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PendingInvitations } from './PendingInvitations';

describe('PendingInvitations', () => {
  it('renders the invitations', async () => {
    const { container } = render(<PendingInvitations />);
    expect(screen.getByRole('region', { name: /Pending invitations/ })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Expired')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('resends and revokes', async () => {
    const onResend = vi.fn();
    const onRevoke = vi.fn();
    const { container } = render(<PendingInvitations onResend={onResend} onRevoke={onRevoke} />);
    await userEvent.click(screen.getByRole('button', { name: 'Resend invitation to taylor@example.com' }));
    expect(onResend).toHaveBeenCalledWith(expect.objectContaining({ id: 'i1' }));
    expect(screen.getByRole('button', { name: 'Resend invitation to taylor@example.com' })).toHaveTextContent('Sent');
    expect(screen.getByRole('status')).toHaveTextContent('Invitation resent to taylor@example.com.');
    for (const email of ['taylor', 'casey', 'drew']) {
      await userEvent.click(screen.getByRole('button', { name: `Revoke invitation to ${email}@example.com` }));
    }
    expect(onRevoke).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('heading', { name: 'No pending invitations' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
