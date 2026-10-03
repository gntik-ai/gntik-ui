import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ResourceIndexPage from './Page';
import { resourceRows } from './data';

describe('ResourceIndexPage', () => {
  it('renders the header, filters, table and pagination', { timeout: 15000 }, async () => {
    const { container } = render(<ResourceIndexPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Deployments' })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: 'Filters' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Deployments' });
    expect(within(table).getAllByRole('row')).toHaveLength(11);
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('selects rows, shows the bulk bar and deletes them', { timeout: 15000 }, async () => {
    const onBulkAction = vi.fn();
    const { container } = render(<ResourceIndexPage onBulkAction={onBulkAction} />);
    const first = resourceRows[0]!;
    const second = resourceRows[1]!;
    await userEvent.click(screen.getByRole('checkbox', { name: new RegExp(first.name) }));
    await userEvent.click(screen.getByRole('checkbox', { name: new RegExp(`^Select ${second.name}`) }));
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' });
    expect(within(bar).getByRole('status')).toHaveTextContent('2 of 24 deployments selected');
    await expectNoAxeViolations(container);
    await userEvent.click(within(bar).getByRole('button', { name: 'Delete' }));
    expect(onBulkAction).toHaveBeenCalledWith('delete', [first.id, second.id]);
  });

  it('shows the no-results state and clears the search', { timeout: 15000 }, async () => {
    render(<ResourceIndexPage />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'nothing-here');
    expect(screen.getByRole('heading', { name: /No deployments match/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(within(screen.getByRole('table', { name: 'Deployments' })).getAllByRole('row')).toHaveLength(11);
  });
});
