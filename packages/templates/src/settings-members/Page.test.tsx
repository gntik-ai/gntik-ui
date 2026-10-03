import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsMembersPage from './Page';

describe('SettingsMembersPage', () => {
  it('renders members, invitations and the role matrix', () => {
    render(<SettingsMembersPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Members' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Workspace members' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pending invitations' })).toBeInTheDocument();
    const matrix = screen.getByRole('table', { name: 'Permissions by role' });
    expect(within(matrix).getByRole('rowheader', { name: 'Delete the workspace' })).toBeInTheDocument();
  }, 15000);

  it('opens the invite dialog from the header and sends invitations', async () => {
    const onInvite = vi.fn();
    render(<SettingsMembersPage onInvite={onInvite} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Invite members' })[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Invite members' });
    await userEvent.type(within(dialog).getByLabelText(/Email addresses/), 'new.person@example.com,');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
    expect(onInvite).toHaveBeenCalledWith(expect.objectContaining({ emails: ['new.person@example.com'] }));
    expect(await screen.findByText('new.person@example.com')).toBeInTheDocument();
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsMembersPage />);
    await expectNoAxeViolations(container);
  }, 15000);
});
