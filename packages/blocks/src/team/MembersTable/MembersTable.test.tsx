import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { MembersTable } from './MembersTable';

describe('MembersTable', () => {
  it('renders the members', async () => {
    const { container } = render(<MembersTable />);
    const table = screen.getByRole('table', { name: 'Workspace members' });
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    expect(screen.getByRole('combobox', { name: 'Role for Avery Collins' })).toHaveAttribute('data-disabled');
    expect(screen.getByText('Never')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('changes a role and removes a member', async () => {
    const onRoleChange = vi.fn();
    const onRemove = vi.fn();
    render(<MembersTable onRoleChange={onRoleChange} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Role for Jordan Lee' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Admin' }));
    expect(onRoleChange).toHaveBeenCalledWith('u3', 'admin');

    await userEvent.click(screen.getByRole('button', { name: 'Actions for Riley Chen' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Remove from workspace' }));
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ id: 'u4' }));
    expect(screen.queryByText('Riley Chen')).not.toBeInTheDocument();
  });
});
