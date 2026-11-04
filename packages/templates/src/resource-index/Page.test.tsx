import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
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
    expect(screen.queryByText('2 selected')).toBeNull(); // DataTable's own summary is off
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

  it(
    'is generic over the row type: columns, filter fields and statuses come from props',
    { timeout: 15000 },
    async () => {
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
    },
  );

  it('links the name cell through the LinkProvider and reports row clicks', { timeout: 15000 }, async () => {
    const onRowClick = vi.fn();
    const RouterLink = ({ href, ...props }: ComponentPropsWithRef<'a'>) => (
      <a
        data-router=""
        href={href}
        {...props}
        onClick={(e) => {
          e.preventDefault();
          props.onClick?.(e);
        }}
      />
    );
    const { container } = render(
      <LinkProvider component={RouterLink}>
        <ResourceIndexPage<Agent>
          title="Agents"
          rows={agents}
          columns={agentColumns}
          getRowHref={(r) => `/agents/${r.id}`}
          onRowClick={onRowClick}
        />
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

describe('ResourceIndexPage URL state', () => {
  const rows = [
    { id: 'a', name: 'api alpha', status: 'failed' },
    { id: 'b', name: 'api zeta', status: 'failed' },
    { id: 'c', name: 'api running', status: 'running' },
  ];
  const columns: DataTableColumn<(typeof rows)[number]>[] = [
    { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
    { id: 'status', header: 'Status', accessor: (row) => row.status, sortable: false },
  ];
  const fields = [{ id: 'status', label: 'Status', options: ['Failed', 'Running'] }];
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    history.replaceState(null, '', '/');
  });

  it('reads a deep link, canonicalizes filter casing and controls descending row order', async () => {
    history.replaceState(null, '', '/?q=api&f=status:failed&sort=name:desc');
    const replace = vi.spyOn(history, 'replaceState');
    const push = vi.spyOn(history, 'pushState');
    render(<ResourceIndexPage syncUrl rows={rows} columns={columns} filterFields={fields} savedViews={[]} />);
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('api');
    const table = screen.getByRole('table', { name: 'Deployments' });
    expect(
      within(table)
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1]?.textContent),
    ).toEqual(['api zeta', 'api alpha']);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(screen.getByRole('button', { name: 'Add filter' }));
    expect(await screen.findByRole('menuitemcheckbox', { name: 'Failed' })).toHaveAttribute('aria-checked', 'true');
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('pushes filter changes and Back restores the checked options and rows', async () => {
    history.replaceState(null, '', '/?q=api&f=status:failed&sort=name:desc');
    const push = vi.spyOn(history, 'pushState');
    render(<ResourceIndexPage syncUrl rows={rows} columns={columns} filterFields={fields} savedViews={[]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add filter' }));
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Running' }));
    await waitFor(() =>
      expect(new URLSearchParams(location.search).getAll('f')).toEqual(['status:Failed', 'status:Running']),
    );
    expect(push).toHaveBeenCalledTimes(1);
    await act(async () => {
      const popped = new Promise<void>((resolve) =>
        window.addEventListener('popstate', () => resolve(), { once: true }),
      );
      history.back();
      await popped;
    });
    expect(screen.getByRole('menuitemcheckbox', { name: 'Running' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Failed' })).toHaveAttribute('aria-checked', 'true');
    const table = screen.getByRole('table', { name: 'Deployments' });
    expect(within(table).getAllByRole('row')).toHaveLength(3);
  });

  it('merges both clearAll patches into one push while preserving foreign keys and hash', async () => {
    history.replaceState(null, '', '/?q=api&f=status:failed&utm_source=x#details');
    const push = vi.spyOn(history, 'pushState');
    const replace = vi.spyOn(history, 'replaceState');
    render(<ResourceIndexPage syncUrl rows={rows} columns={columns} filterFields={fields} savedViews={[]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
    await waitFor(() => expect(location.search).toBe('?utm_source=x'));
    expect(location.hash).toBe('#details');
    expect(push).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  it('merges the filters and query of a saved view into one history entry', async () => {
    history.replaceState(null, '', '/');
    const push = vi.spyOn(history, 'pushState');
    render(
      <ResourceIndexPage
        syncUrl
        rows={rows}
        columns={columns}
        filterFields={fields}
        savedViews={[
          { value: 'failed', label: 'Failed APIs', query: 'api', filters: [{ field: 'status', value: 'Failed' }] },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Saved view' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Failed APIs' }));
    await waitFor(() => expect(new URLSearchParams(location.search).get('q')).toBe('api'));
    expect(new URLSearchParams(location.search).getAll('f')).toEqual(['status:Failed']);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it.each(['missing:desc', 'status:asc', 'name:invalid'])(
    'ignores invalid filters and sort %s without rewriting',
    (sort) => {
      history.replaceState(null, '', `/?f=unknown:value&f=status:unknown&sort=${sort}`);
      const replace = vi.spyOn(history, 'replaceState');
      const push = vi.spyOn(history, 'pushState');
      render(<ResourceIndexPage syncUrl rows={rows} columns={columns} filterFields={fields} savedViews={[]} />);
      expect(within(screen.getByRole('table', { name: 'Deployments' })).getAllByRole('row')).toHaveLength(4);
      expect(screen.queryByRole('button', { name: /Remove filter Status/ })).toBeNull();
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'none');
      expect(replace).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    },
  );

  it('splits a filter at the first colon, retaining colons in valid values', () => {
    history.replaceState(null, '', '/?f=status:needs:review');
    render(
      <ResourceIndexPage
        syncUrl
        rows={[{ id: 'x', name: 'review', status: 'needs:review' }, ...rows]}
        columns={columns}
        filterFields={[{ id: 'status', label: 'Status', options: ['Needs:Review'] }]}
        savedViews={[]}
      />,
    );
    expect(within(screen.getByRole('table', { name: 'Deployments' })).getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Remove filter Status.*Needs:Review/ })).toBeInTheDocument();
  });

  it('replaces a controlled sort change', async () => {
    history.replaceState(null, '', '/?sort=name:desc');
    const replace = vi.spyOn(history, 'replaceState');
    const push = vi.spyOn(history, 'pushState');
    render(<ResourceIndexPage syncUrl rows={rows} columns={columns} filterFields={fields} savedViews={[]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Name' }));
    await waitFor(() => expect(new URLSearchParams(location.search).get('sort')).toBe('name:asc'));
    expect(replace).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('round-trips sorting for a column whose id contains a colon', async () => {
    history.replaceState(null, '', '/');
    render(
      <ResourceIndexPage
        syncUrl
        rows={rows}
        columns={[{ id: 'resource:name', header: 'Name', accessor: (row) => row.name, sortable: true }]}
        savedViews={[]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Name' }));
    await waitFor(() => expect(new URLSearchParams(location.search).get('sort')).toBe('resource:name:asc'));
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(screen.getByRole('button', { name: 'Name' }));
    await waitFor(() => expect(new URLSearchParams(location.search).get('sort')).toBe('resource:name:desc'));
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');
    expect(
      within(screen.getByRole('table', { name: 'Deployments' }))
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1]?.textContent),
    ).toEqual(['api zeta', 'api running', 'api alpha']);
  });

  it('keeps URL access disabled by default while local search and sorting still work', async () => {
    history.replaceState(null, '', '/?q=ignore&f=status:failed&sort=name:desc');
    const replace = vi.spyOn(history, 'replaceState');
    const push = vi.spyOn(history, 'pushState');
    const add = vi.spyOn(window, 'addEventListener');
    render(<ResourceIndexPage rows={rows} columns={columns} filterFields={fields} savedViews={[]} />);
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'zeta');
    expect(within(screen.getByRole('table', { name: 'Deployments' })).getAllByRole('row')).toHaveLength(2);
    await userEvent.clear(screen.getByRole('searchbox', { name: 'Search' }));
    await userEvent.click(screen.getByRole('button', { name: 'Name' }));
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(add.mock.calls.some(([name]) => name === 'popstate')).toBe(false);
  });
});
