import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import UsageAnalyticsPage from './Page';
import { usageRows } from './data';

describe('UsageAnalyticsPage', () => {
  it('renders the header, filters, charts and breakdown', { timeout: 15000 }, async () => {
    const { container } = render(<UsageAnalyticsPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Usage analytics' })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Requests by environment' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Usage by project' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('filters the breakdown by search and exports what is shown', { timeout: 15000 }, async () => {
    const onExport = vi.fn();
    render(<UsageAnalyticsPage onExport={onExport} />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'webhooks');
    const table = screen.getByRole('table', { name: 'Usage by project' });
    const expected = usageRows.filter((r) => r.project === 'webhooks').length;
    expect(within(table).getAllByRole('row')).toHaveLength(expected + 1);
    await userEvent.click(screen.getAllByRole('button', { name: 'Export CSV' })[0]!);
    expect(onExport).toHaveBeenCalledWith(expect.objectContaining({ query: 'webhooks' }));
    expect(onExport.mock.calls[0]?.[0].rows).toHaveLength(expected);
  });

  it('shows the no-results state when nothing matches', { timeout: 15000 }, async () => {
    render(<UsageAnalyticsPage />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'zzz');
    expect(screen.getByText(/No projects match/)).toBeInTheDocument();
  });
});
