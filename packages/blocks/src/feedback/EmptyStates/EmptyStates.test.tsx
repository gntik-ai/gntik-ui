import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { FirstRunEmpty, NoAccessEmpty, NoResultsEmpty } from './EmptyStates';

describe('EmptyStates', () => {
  it('renders the three defaults', async () => {
    const { container } = render(
      <>
        <FirstRunEmpty />
        <NoResultsEmpty />
        <NoAccessEmpty />
      </>,
    );
    expect(screen.getByRole('heading', { name: 'Create your first project' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /No projects match/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'You don’t have access to Billing' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('wires the first-run and no-results actions', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onClearFilters = vi.fn();
    const onClearSearch = vi.fn();
    render(
      <>
        <FirstRunEmpty onAction={onAction} />
        <NoResultsEmpty onClearFilters={onClearFilters} onClearSearch={onClearSearch} />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'New project' }));
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });

  it('requests access once', async () => {
    const onRequestAccess = vi.fn(() => Promise.resolve());
    render(<NoAccessEmpty onRequestAccess={onRequestAccess} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Request access' }));
    expect(onRequestAccess).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('button', { name: 'Access requested' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Access request sent');
  });
});
