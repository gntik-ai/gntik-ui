import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import { PermissionMatrix, type PermissionMatrixProps, type PermissionRole, type PermissionSection } from './PermissionMatrix';
import PermissionMatrixBasic from './examples/PermissionMatrixBasic';

const roles: PermissionRole[] = [
  { id: 'owner', label: 'Owner', readOnly: true },
  { id: 'admin', label: 'Admin' },
  { id: 'viewer', label: 'Viewer' },
];
const sections: PermissionSection[] = [
  { id: 'p', label: 'Projects', permissions: [{ id: 'read', label: 'Read' }, { id: 'write', label: 'Write' }] },
  { id: 'b', label: 'Billing', permissions: [{ id: 'invoices', label: 'Invoices' }] },
];

function setup(props: Partial<PermissionMatrixProps> = {}) {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <PermissionMatrix
      aria-label="Roles"
      roles={roles}
      sections={sections}
      defaultValue={{ owner: { read: 'allowed', write: 'allowed', invoices: 'allowed' }, admin: { read: 'allowed', write: 'denied' } }}
      resolveInherited={(roleId) => (roleId === 'viewer' ? 'allowed' : undefined)}
      getDisabledReason={(roleId, permId) => (roleId === 'admin' && permId === 'invoices' ? 'Billing is managed by the owner.' : undefined)}
      onChange={onChange}
      {...props}
    />,
  );
  const cell = (perm: string, role: string) => screen.getByRole('button', { name: new RegExp(`^${perm}, ${role}: `) });
  return { user, onChange, cell };
}

describe('PermissionMatrix', () => {
  it('renders a grid with icon + word per state; inherited says what it resolves to', () => {
    const { cell } = setup();
    expect(screen.getByRole('grid', { name: 'Roles' })).toBeInTheDocument();
    expect(cell('Read', 'Admin')).toHaveTextContent('Allowed');
    expect(cell('Write', 'Admin')).toHaveTextContent('Denied');
    expect(cell('Read', 'Viewer')).toHaveAccessibleName('Read, Viewer: Inherited (Allowed)');
    expect(cell('Read', 'Viewer')).toHaveAttribute('data-state', 'inherited');
    expect(screen.getByRole('columnheader', { name: /^Owner\s*\(Read-only\)$/ })).toBeInTheDocument();
  });

  it('Tab enters on one cell only; arrows move, skipping section headings', async () => {
    const { user, cell } = setup();
    await user.tab();
    expect(cell('Read', 'Owner')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(cell('Read', 'Admin')).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(cell('Invoices', 'Admin')).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowLeft}');
    expect(cell('Write', 'Owner')).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
    await user.tab({ shift: true });
    expect(cell('Write', 'Owner')).toHaveFocus();
  });

  it('Home / End, Ctrl+Home / Ctrl+End, PageUp / PageDown', async () => {
    const { user, cell } = setup();
    await user.tab();
    await user.keyboard('{End}');
    expect(cell('Read', 'Viewer')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(cell('Read', 'Owner')).toHaveFocus();
    await user.keyboard('{Control>}{End}{/Control}');
    expect(cell('Invoices', 'Viewer')).toHaveFocus();
    await user.keyboard('{Control>}{Home}{/Control}');
    expect(cell('Read', 'Owner')).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(cell('Invoices', 'Owner')).toHaveFocus();
    await user.keyboard('{PageUp}');
    expect(cell('Read', 'Owner')).toHaveFocus();
  });

  it('Enter / Space cycle allowed → denied → inherited; A / D / I set directly', async () => {
    const { user, cell, onChange } = setup();
    cell('Read', 'Admin').focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ admin: { read: 'denied', write: 'denied' } }), { roleId: 'admin', permissionId: 'read', state: 'denied' });
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), { roleId: 'admin', permissionId: 'read', state: 'inherited' });
    expect(cell('Read', 'Admin')).toHaveTextContent('Inherited');
    await user.keyboard('a');
    expect(cell('Read', 'Admin')).toHaveTextContent('Allowed');
    await user.keyboard('{ArrowDown}d');
    expect(onChange).toHaveBeenCalledTimes(3); // Write was already denied
    await user.keyboard('i');
    expect(cell('Write', 'Admin')).toHaveTextContent('Inherited');
  });

  it('without allowInherit the cycle is allowed ↔ denied', async () => {
    const { user, cell } = setup({ allowInherit: false });
    cell('Write', 'Admin').focus();
    await user.keyboard('{Enter}');
    expect(cell('Write', 'Admin')).toHaveTextContent('Allowed');
  });

  it('read-only columns and disabled cells are focusable, explain why and do not change', async () => {
    const { user, cell, onChange } = setup();
    await user.click(cell('Read', 'Owner'));
    expect(cell('Read', 'Owner')).toHaveAttribute('aria-disabled', 'true');
    expect(cell('Read', 'Owner')).toHaveAccessibleDescription('Owner permissions cannot be changed.');
    await user.keyboard('d');
    const invoices = cell('Invoices', 'Admin');
    invoices.focus();
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(invoices).toHaveAccessibleDescription('Billing is managed by the owner.');
    await user.hover(invoices);
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Billing is managed by the owner.'));
  });

  it('ArrowRight moves backwards in RTL', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="ar">
        <PermissionMatrix aria-label="Roles" roles={roles} sections={sections} />
      </I18nProvider>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[1]?.focus();
    await user.keyboard('{ArrowRight}');
    expect(buttons[0]).toHaveFocus();
  });

  it('PermissionMatrixBasic has no axe violations', async () => {
    render(<PermissionMatrixBasic />);
    expect(screen.getByRole('grid', { name: 'Workspace roles' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});
