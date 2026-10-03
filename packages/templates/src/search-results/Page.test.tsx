import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import SearchResultsPage from './Page';

describe('SearchResultsPage', () => {
  it('renders facets and grouped results', { timeout: 15000 }, async () => {
    render(<SearchResultsPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Filters' })).toBeInTheDocument();
    for (const name of ['Projects', 'Deployments', 'Members', 'Documents']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    await expectNoAxeViolations();
  });

  it('moves through results with the arrow keys', { timeout: 15000 }, async () => {
    render(<SearchResultsPage />);
    await userEvent.click(screen.getByRole('searchbox', { name: 'Search the workspace' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'billing-api' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('link', { name: 'orders-api' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('link', { name: 'Usage-based billing guide' })).toHaveFocus();
  });

  it('filters with a facet and shows NoResultsEmpty', { timeout: 15000 }, async () => {
    render(<SearchResultsPage />);
    const facets = screen.getByRole('complementary', { name: 'Filters' });
    await userEvent.click(within(facets).getByRole('checkbox', { name: /Members/ }));
    expect(screen.queryByRole('region', { name: 'Projects' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Riley Morgan' })).toBeInTheDocument();

    const box = screen.getByRole('searchbox', { name: 'Search the workspace' });
    await userEvent.clear(box);
    await userEvent.type(box, 'zzz');
    expect(screen.getByRole('heading', { level: 2, name: /No results match/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(within(facets).getByRole('checkbox', { name: /Members/ })).not.toBeChecked();
  });
});
