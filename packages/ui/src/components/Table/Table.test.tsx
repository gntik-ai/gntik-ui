import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';
import { nextSortDirection } from './table.variants';
import TableSortable from './examples/TableSortable';
import TableSelectable from './examples/TableSelectable';

const firstColumn = () =>
  within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row').map((r) => within(r).getAllByRole('cell')[0]!.textContent);

describe('Table', () => {
  it('cycles none → ascending ⇄ descending', () => {
    expect(nextSortDirection('none')).toBe('ascending');
    expect(nextSortDirection('ascending')).toBe('descending');
    expect(nextSortDirection('descending')).toBe('ascending');
  });

  it('exposes a named table with column headers and aria-sort on sortable ones', () => {
    render(<TableSortable />);
    const table = screen.getByRole('table', { name: 'Deployments in this project, last 30 days.' });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
    expect(screen.getByRole('columnheader', { name: /Cost/ })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('columnheader', { name: /Deployment/ })).toHaveAttribute('aria-sort', 'none');
    expect(screen.getByRole('columnheader', { name: 'Status' })).not.toHaveAttribute('aria-sort');
  });

  it('Tab moves focus across the sortable header buttons', async () => {
    const user = userEvent.setup();
    render(<TableSortable />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Deployment' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Region' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Requests' })).toHaveFocus();
  });

  it('Enter on a sortable header sorts ascending, then toggles descending', async () => {
    const user = userEvent.setup();
    render(<TableSortable />);
    const th = screen.getByRole('columnheader', { name: /Deployment/ });
    within(th).getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(th).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('columnheader', { name: /Cost/ })).toHaveAttribute('aria-sort', 'none');
    expect(firstColumn()[0]).toBe('auth-service');
    await user.keyboard('{Enter}');
    expect(th).toHaveAttribute('aria-sort', 'descending');
    expect(firstColumn()[0]).toBe('web-frontend');
  });

  it('Space on a sortable header cycles aria-sort too', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="ascending" onSortChange={onSortChange}>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    await user.tab();
    await user.keyboard(' ');
    expect(onSortChange).toHaveBeenCalledWith('descending');
  });

  it('applies density, sticky header and selected rows', async () => {
    const user = userEvent.setup();
    render(<TableSelectable />);
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'compact');
    expect(screen.getByRole('columnheader', { name: 'Deployment' })).toHaveClass('sticky', 'top-0', 'h-9');
    expect(screen.getByRole('region', { name: 'Deployments' })).toHaveAttribute('tabindex', '0');
    const box = screen.getByRole('checkbox', { name: 'Select web-frontend' });
    const row = box.closest('tr');
    expect(row).not.toHaveAttribute('data-selected');
    await user.click(box);
    expect(row).toHaveAttribute('data-selected');
    expect(screen.getByRole('checkbox', { name: 'Select billing-api' }).closest('tr')).toHaveAttribute('data-selected');
  });

  it('right-aligned cells and comfortable density by default', () => {
    render(
      <Table>
        <TableBody>
          <TableRow><TableCell align="right">42</TableCell></TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole('cell')).toHaveClass('text-right', 'py-3');
  });

  it('examples have no axe violations', async () => {
    render(<><TableSortable /><TableSelectable /></>);
    await expectNoAxeViolations();
  });
});
