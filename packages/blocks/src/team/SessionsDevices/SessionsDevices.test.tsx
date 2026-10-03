import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SessionsDevices } from './SessionsDevices';

describe('SessionsDevices', () => {
  it('renders the sessions with the current one marked', async () => {
    const { container } = render(<SessionsDevices />);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('This device')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revoke session on MacBook Pro' })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('revokes one session, then all others', async () => {
    const onRevoke = vi.fn();
    const onRevokeOthers = vi.fn();
    render(<SessionsDevices onRevoke={onRevoke} onRevokeOthers={onRevokeOthers} />);
    await userEvent.click(screen.getByRole('button', { name: 'Revoke session on Pixel 8' }));
    expect(onRevoke).toHaveBeenCalledWith(expect.objectContaining({ id: 's2' }));
    expect(screen.getByRole('status')).toHaveTextContent('Signed out of Pixel 8.');
    await userEvent.click(screen.getByRole('button', { name: 'Sign out other sessions' }));
    expect(onRevokeOthers).toHaveBeenCalledWith([expect.objectContaining({ id: 's3' }), expect.objectContaining({ id: 's4' })]);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Sign out other sessions' })).toBeDisabled();
  });
});
