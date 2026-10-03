import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import type { DataTableColumn } from '@gntik-ai/blocks';
import { LinkProvider } from '@gntik-ai/ui';
import type { ComponentPropsWithRef } from 'react';
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

  interface Agent {
    id: string;
    name: string;
    state: 'active' | 'draft' | 'retired';
  }
  const agents: Agent[] = [
    { id: 'ag_1', name: 'triage-bot', state: 'active' },
    { id: 'ag_2', name: 'summarizer', state: 'draft' },
    { id: 'ag_3', name: 'legacy-router', state: 'retired' },
  ];
  const agentColumns: DataTableColumn<Agent>[] = [
    { id: 'name', header: 'Agent', accessor: (r) => r.name },
    { id: 'state', header: 'State', accessor: (r) => r.state },
  ];

  it('is generic over the row type: columns, filter fields and statuses come from props', { timeout: 15000 }, async () => {
    render(
      <ResourceIndexPage<Agent>
        title="Agents"
        noun={['agent', 'agents']}
        rows={agents}
        columns={agentColumns}
        filterFields={[{ id: 'state', label: 'State', options: ['Active', 'Draft', 'Retired'] }]}
        savedViews={[{ value: 'all', label: 'All agents', filters: [] }]}
      />,
    );
    const table = screen.getByRole('table', { name: 'Agents' });
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'summ');
    expect(within(table).getAllByRole('row')).toHaveLength(2);
  });

  it('links the name cell through the LinkProvider and reports row clicks', { timeout: 15000 }, async () => {
    const onRowClick = vi.fn();
    const RouterLink = ({ href, ...props }: ComponentPropsWithRef<'a'>) => (
      <a data-router="" href={href} {...props} onClick={(e) => { e.preventDefault(); props.onClick?.(e); }} />
    );
    const { container } = render(
      <LinkProvider component={RouterLink}>
        <ResourceIndexPage<Agent> title="Agents" rows={agents} columns={agentColumns} getRowHref={(r) => `/agents/${r.id}`} onRowClick={onRowClick} />
      </LinkProvider>,
    );
    const link = screen.getByRole('link', { name: 'triage-bot' });
    expect(link).toHaveAttribute('href', '/agents/ag_1');
    expect(link).toHaveAttribute('data-router');
    await userEvent.click(link);
    expect(onRowClick).toHaveBeenCalledWith(agents[0]);
    await expectNoAxeViolations(container);
  });

  it('without an href the name cell is a button that calls onRowClick', { timeout: 15000 }, async () => {
    const onRowClick = vi.fn();
    render(<ResourceIndexPage onRowClick={onRowClick} />);
    const first = resourceRows[0]!;
    await userEvent.click(screen.getByRole('button', { name: first.name }));
    expect(onRowClick).toHaveBeenCalledWith(first);
  });
});
