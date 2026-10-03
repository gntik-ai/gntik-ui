import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('renders search, controls and the default chips', async () => {
    const { container } = render(<FilterBar resultCount={12} />);
    expect(screen.getByRole('search', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove filter Status: Running' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('adds, removes and clears filters', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const onQueryChange = vi.fn();
    render(<FilterBar onFiltersChange={onFiltersChange} onQueryChange={onQueryChange} />);
    await user.click(screen.getByRole('button', { name: 'Remove filter Region: eu-west-1' }));
    expect(onFiltersChange).toHaveBeenLastCalledWith([{ field: 'status', value: 'Running' }]);
    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Failed' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Remove filter Status: Failed' })).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'api');
    expect(onQueryChange).toHaveBeenLastCalledWith('api');
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onFiltersChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole('list', { name: 'Active filters' })).toBeNull();
  });

  it('applies a saved view', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(<FilterBar onViewChange={onViewChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Saved view' }));
    await user.click(await screen.findByRole('option', { name: 'Needs attention' }));
    expect(onViewChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'attention' }));
    expect(screen.getByRole('button', { name: 'Remove filter Status: Degraded' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove filter Status: Running' })).toBeNull();
  });
});
