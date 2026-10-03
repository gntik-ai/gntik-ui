import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import UsageAnalyticsPage from './Page';
import { filterUsage, usageRows, type UsageRow } from './data';
import type { DataTableColumn } from '@gntik-ai/blocks';

describe('UsageAnalyticsPage', () => {
  it('renders the header, filters, charts and breakdown', { timeout: 15000 }, async () => {
    const { container } = render(<UsageAnalyticsPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Usage analytics' })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Requests by environment' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Infrastructure cost' })).toBeInTheDocument();
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

  it('takes data-driven charts, columns, filter fields and a search placeholder', { timeout: 15000 }, async () => {
    type Point = { week: string; Calls: number };
    const rows: UsageRow[] = [
      { id: 'a', project: 'tenant-a', environment: 'dev', region: 'local', requests: 10, errorRate: 0, cost: 1 },
      { id: 'b', project: 'tenant-b', environment: 'prod', region: 'local', requests: 20, errorRate: 0, cost: 2 },
    ];
    const columns: DataTableColumn<UsageRow>[] = [
      { id: 'project', header: 'Tenant', accessor: (r) => r.project },
      { id: 'environment', header: 'Stage', accessor: (r) => r.environment, variant: 'mono' },
    ];
    render(
      <UsageAnalyticsPage<Point, Point>
        rows={rows}
        columns={columns}
        filterFields={[{ id: 'environment', label: 'Stage', options: ['dev', 'prod'] }]}
        searchPlaceholder="Search tenants…"
        primaryChart={{ title: 'Function calls', ranges: [{ value: 'w', label: 'Weekly' }], dataByRange: { w: [{ week: 'W1', Calls: 3 }] }, index: 'week', categories: ['Calls'] }}
        trafficRanges={[{ value: 'w', label: 'Weekly' }]}
        trafficByRange={{ w: [{ week: 'W1', Calls: 5 }] }}
        secondaryChart={{ title: 'Calls by stage', index: 'week', categories: ['Calls'] }}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Function calls' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Calls by stage' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search tenants…')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Usage by project' });
    expect(within(table).getByRole('columnheader', { name: /Stage/ })).toBeInTheDocument();
    expect(within(table).getByText('prod')).toBeInTheDocument();
  });

  it('filters on any row field named by the filter id', () => {
    const rows = usageRows.slice(0, 6);
    const region = rows[0]!.region;
    expect(filterUsage(rows, '', [{ field: 'region', value: region }]).every((r) => r.region === region)).toBe(true);
    expect(filterUsage(rows, '', [{ field: 'project', value: rows[1]!.project }]).map((r) => r.project)).toEqual(
      rows.filter((r) => r.project === rows[1]!.project).map((r) => r.project),
    );
    expect(filterUsage(rows, '', [{ field: 'unknown', value: 'x' }])).toHaveLength(rows.length);
  });
});
