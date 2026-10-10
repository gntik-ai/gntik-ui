import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import type { DataTableColumn } from '../DataTable/data-table-utils';
import { SubordinateList, type SubordinateListProps } from './SubordinateList';
import ResourceFormExample from './examples/ResourceForm';

interface Row {
  id: string;
  name: string;
}
const columns: DataTableColumn<Row>[] = [{ id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true }];
const rows: Row[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  name: `Record ${i + 1}`,
}));
const props: SubordinateListProps<Row> = {
  title: 'History',
  headingLevel: 'h2',
  count: 37,
  columns,
  rows,
  getRowId: (row) => row.id,
  pagination: null,
  loading: false,
  error: null,
  onRetry: () => {},
  emptyState: <p>No history yet</p>,
};

// The public prop contract: every omitted input must be a type error.
function requiredProps(input: SubordinateListProps<Row>) {
  const { title, headingLevel, count, columns, rows, getRowId, pagination, loading, error, onRetry, emptyState } = input;
  // @ts-expect-error title is required
  <SubordinateList
    headingLevel={headingLevel}
    count={count}
    columns={columns}
    rows={rows}
    getRowId={getRowId}
    pagination={pagination}
    loading={loading}
    error={error}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error headingLevel is required
  <SubordinateList
    title={title}
    count={count}
    columns={columns}
    rows={rows}
    getRowId={getRowId}
    pagination={pagination}
    loading={loading}
    error={error}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error count is required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    columns={columns}
    rows={rows}
    getRowId={getRowId}
    pagination={pagination}
    loading={loading}
    error={error}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error columns are required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    count={count}
    rows={rows}
    getRowId={getRowId}
    pagination={pagination}
    loading={loading}
    error={error}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error rows are required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    count={count}
    columns={columns}
    getRowId={getRowId}
    pagination={pagination}
    loading={loading}
    error={error}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error getRowId is required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    count={count}
    columns={columns}
    rows={rows}
    pagination={pagination}
    loading={loading}
    error={error}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error pagination is required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    count={count}
    columns={columns}
    rows={rows}
    getRowId={getRowId}
    loading={loading}
    error={error}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error loading is required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    count={count}
    columns={columns}
    rows={rows}
    getRowId={getRowId}
    pagination={pagination}
    error={error}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error error is required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    count={count}
    columns={columns}
    rows={rows}
    getRowId={getRowId}
    pagination={pagination}
    loading={loading}
    onRetry={onRetry}
    emptyState={emptyState}
  />;
  // @ts-expect-error onRetry is required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    count={count}
    columns={columns}
    rows={rows}
    getRowId={getRowId}
    pagination={pagination}
    loading={loading}
    error={error}
    emptyState={emptyState}
  />;
  // @ts-expect-error emptyState is required
  <SubordinateList
    title={title}
    headingLevel={headingLevel}
    count={count}
    columns={columns}
    rows={rows}
    getRowId={getRowId}
    pagination={pagination}
    loading={loading}
    error={error}
    onRetry={onRetry}
  />;
}
void requiredProps;

describe('SubordinateList', () => {
  it('embeds a paginated history and an unpaginated consumer section in a resource-form host', async () => {
    render(<ResourceFormExample />);
    expect(screen.getByRole('form', { name: 'Resource settings' })).toBeVisible();
    const history = screen.getByRole('region', { name: 'History' });
    const consumers = screen.getByRole('region', { name: 'Consumers' });
    expect(within(history).getByRole('navigation', { name: 'History pagination' })).toBeVisible();
    expect(within(consumers).queryByRole('navigation')).not.toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });

  for (const theme of ['dark', 'light', 'high_contrast']) {
    it.each(['default', 'loading', 'empty', 'error'] as const)(`has no axe violations in ${theme} / %s`, async (state) => {
      document.documentElement.className = theme;
      const { container } = render(
        <SubordinateList
          {...props}
          loading={state === 'loading'}
          rows={state === 'empty' ? [] : rows}
          error={
            state === 'error'
              ? {
                  title: 'History unavailable',
                  message: 'Please retry.',
                  code: null,
                }
              : null
          }
          pagination={{
            limit: 10,
            offset: 0,
            total: state === 'empty' ? 0 : 37,
            onPageChange: () => {},
          }}
        />,
      );
      await expectNoAxeViolations(container);
    });
  }

  it.each(['en', 'es'])('shows only the supplied error and retries the failing section once in %s', async (locale) => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <I18nProvider locale={locale}>
        <SubordinateList
          {...props}
          error={{
            title: 'History unavailable',
            message: 'Please retry this section.',
            code: null,
          }}
          onRetry={onRetry}
        />
        <SubordinateList {...props} title="Consumers" headingLevel="h3" />
      </I18nProvider>,
    );
    const failed = screen.getByRole('region', { name: 'History' });
    expect(
      within(failed).getByRole('heading', {
        name: 'History unavailable',
        level: 3,
      }),
    ).toBeVisible();
    expect(failed).toHaveTextContent('Please retry this section.');
    expect(failed).not.toHaveTextContent(/503|req_|Contact support|deployments|Add policy/i);
    expect(within(failed).queryByRole('table')).not.toBeInTheDocument();
    expect(within(failed).queryByRole('navigation')).not.toBeInTheDocument();
    const retryLabel = locale === 'es' ? 'Reintentar' : 'Try again';
    await user.click(within(failed).getByRole('button', { name: retryLabel }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    const healthy = screen.getByRole('region', { name: 'Consumers' });
    expect(within(healthy).getByRole('table', { name: 'Consumers' })).toBeVisible();
    expect(within(healthy).queryByRole('button', { name: retryLabel })).not.toBeInTheDocument();
  });

  it('shows an explicit error code and keeps the header while a section has failed', () => {
    render(
      <SubordinateList
        {...props}
        error={{
          title: 'History unavailable',
          message: 'Try later.',
          code: 'E_LOAD',
        }}
      />,
    );
    expect(screen.getByText('E_LOAD')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'History', level: 2 })).toBeVisible();
  });

  it('replaces the table and pagination with a busy TableSkeleton while loading', () => {
    render(<SubordinateList {...props} loading={true} pagination={{ limit: 10, offset: 0, total: 37, onPageChange: () => {} }} />);
    expect(screen.getByRole('region', { name: 'History' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading table');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders the host empty state instead of a table when rows are empty', () => {
    render(<SubordinateList {...props} rows={[]} count={0} />);
    expect(screen.getByText('No history yet')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'History' })).toHaveAttribute('aria-busy', 'false');
  });

  it('renders every supplied row with server pagination and translates page 2 to offset 10', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(<SubordinateList {...props} pagination={{ limit: 10, offset: 0, total: 37, onPageChange }} />);
    expect(screen.getAllByRole('row')).toHaveLength(13);
    expect(screen.getByRole('region', { name: 'History' })).toHaveTextContent('1–10 of 37');
    expect(screen.getByRole('navigation', { name: 'History pagination' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(10);
    // Controlled: only a new host offset changes the page summary.
    expect(screen.getByText('1–10')).toBeVisible();
    rerender(<SubordinateList {...props} pagination={{ limit: 10, offset: 10, total: 37, onPageChange }} />);
    expect(screen.getByText('11–20')).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    expect(await screen.findAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: '10' })).toBeVisible();
  });

  it('renders a large unpaginated collection without list controls, sorting, virtualization or sticky elements', () => {
    const largeRows = Array.from({ length: 120 }, (_, i) => ({
      id: String(i),
      name: `Entry ${i}`,
    }));
    const { container } = render(<SubordinateList {...props} rows={largeRows} count={120} />);
    expect(screen.getAllByRole('row')).toHaveLength(121);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'History' })).not.toHaveAttribute('data-virtualized');
    for (const element of container.querySelectorAll<HTMLElement>('*')) {
      expect(element.classList.contains('sticky')).toBe(false);
      expect(getComputedStyle(element).position).not.toBe('sticky');
    }
  });

  it.each(['h2', 'h3'] as const)('labels the section with its %s heading and shows count 0 without fixture actions or description', (headingLevel) => {
    render(<SubordinateList {...props} headingLevel={headingLevel} count={0} />);
    const region = screen.getByRole('region', { name: 'History' });
    const heading = within(region).getByRole('heading', {
      name: 'History',
      level: headingLevel === 'h2' ? 2 : 3,
    });
    expect(region).toHaveAttribute('aria-labelledby', heading.id);
    expect(within(region).getByText('0')).toBeVisible();
    expect(within(region).queryByRole('button')).not.toBeInTheDocument();
    expect(region).not.toHaveTextContent(/Add policy|Guardrails|deployments/i);
  });
});
