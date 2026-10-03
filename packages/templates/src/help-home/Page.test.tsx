import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import HelpHomePage from './Page';
import { helpCategories } from './data';

describe('HelpHomePage', () => {
  it('renders search, categories and popular articles', { timeout: 15000 }, async () => {
    render(<HelpHomePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'How can we help?' })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: 'Help articles' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Help center' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(helpCategories.length);
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Deployments' })).toHaveAttribute('href', '/help/deployments');
    expect(screen.getByRole('heading', { level: 2, name: 'Popular articles' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('filters articles and submits the query', { timeout: 15000 }, async () => {
    const onSearch = vi.fn();
    render(<HelpHomePage onSearch={onSearch} />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search help articles' }), 'webhook{Enter}');
    expect(onSearch).toHaveBeenCalledWith('webhook');
    const results = screen.getByRole('region', { name: 'Search results' });
    expect(within(results).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('1 article')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Browse by topic' })).not.toBeInTheDocument();
  });
});
