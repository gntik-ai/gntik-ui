import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { InviteMembersDialog } from './InviteMembersDialog';

describe('InviteMembersDialog', () => {
  it('renders the trigger and an accessible dialog', async () => {
    const { container } = render(<InviteMembersDialog />);
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Invite members' }));
    const dialog = await screen.findByRole('dialog', { name: 'Invite members' });
    await expectNoAxeViolations(dialog);
  });

  it('validates the emails, then submits and closes', async () => {
    const onInvite = vi.fn().mockResolvedValue(undefined);
    render(<InviteMembersDialog defaultOpen onInvite={onInvite} />);
    const input = await screen.findByLabelText(/Email addresses/);
    await userEvent.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(await screen.findByText('Add at least one email address.')).toBeInTheDocument();
    expect(onInvite).not.toHaveBeenCalled();

    await userEvent.type(input, 'not-an-email{Enter}');
    await userEvent.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(onInvite).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Remove not-an-email' }));

    await userEvent.type(input, 'avery@example.com, sam@example.com,');
    await userEvent.click(screen.getByRole('button', { name: 'Send 2 invitations' }));
    expect(onInvite).toHaveBeenCalledWith({ emails: ['avery@example.com', 'sam@example.com'], role: 'member', message: '' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
