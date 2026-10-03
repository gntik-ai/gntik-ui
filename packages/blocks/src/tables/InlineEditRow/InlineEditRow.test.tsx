import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { InlineEditTable } from './InlineEditRow';

describe('InlineEditRow', () => {
  it('renders the editable table in read mode', async () => {
    const { container } = render(<InlineEditTable />);
    expect(screen.getByRole('table', { name: 'Members' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Edit / })).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it('edits, saves with Enter and returns focus', async () => {
    const user = userEvent.setup();
    const onRowSave = vi.fn();
    const { container } = render(<InlineEditTable onRowSave={onRowSave} />);
    await user.click(screen.getByRole('button', { name: 'Edit Sam Carter' }));
    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(name).toHaveFocus();
    await expectNoAxeViolations(container);
    await user.clear(name);
    await user.type(name, 'Sam Rivera{Enter}');
    expect(onRowSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'm2', name: 'Sam Rivera', seats: 2 }));
    expect(screen.getByRole('cell', { name: 'Sam Rivera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Sam Rivera' })).toHaveFocus();
  });

  it('cancels with Escape and blocks empty required fields', async () => {
    const user = userEvent.setup();
    render(<InlineEditTable />);
    await user.click(screen.getByRole('button', { name: 'Edit Ana Lopez' }));
    const row = screen.getByRole('textbox', { name: 'Name' }).closest('tr')!;
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    expect(within(row).getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('cell', { name: 'Ana Lopez' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Ana Lopez' })).toHaveFocus();
  });
});
