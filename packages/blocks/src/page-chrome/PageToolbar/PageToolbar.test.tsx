import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PageToolbar } from './PageToolbar';

describe('PageToolbar', () => {
  it('renders the default toolbar', async () => {
    const { container } = render(<PageToolbar />);
    expect(screen.getByRole('toolbar', { name: 'Page toolbar' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Table view' })).toHaveAttribute('aria-pressed', 'true');
    await expectNoAxeViolations(container);
  });

  it('reports search, view and primary action', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onViewChange = vi.fn();
    const onCreate = vi.fn();
    render(
      <PageToolbar
        onSearchChange={onSearchChange}
        onViewChange={onViewChange}
        primaryAction={{ label: 'Create', onClick: onCreate }}
      />,
    );
    await user.type(screen.getByRole('searchbox'), 'api');
    expect(onSearchChange).toHaveBeenLastCalledWith('api');
    await user.click(screen.getByRole('button', { name: 'Grid view' }));
    expect(onViewChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');
    // Clicking the active view keeps it selected.
    await user.click(screen.getByRole('button', { name: 'Grid view' }));
    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
