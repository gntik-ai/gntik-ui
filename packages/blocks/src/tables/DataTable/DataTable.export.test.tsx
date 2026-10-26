import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { downloadFile, I18nProvider } from '@gntik-ai/ui';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './data-table-utils';
import { expectNoAxeViolations } from '../../test/a11y';
import CsvExportExample from './examples/csv-export';

vi.mock('@gntik-ai/ui', async (original) => ({
  ...(await original<typeof import('@gntik-ai/ui')>()),
  downloadFile: vi.fn(),
}));

const rows = Array.from({ length: 95 }, (_, index) => ({ id: String(index + 1), name: `Item ${index + 1}` }));
type Row = (typeof rows)[number];
const columns: DataTableColumn<Row>[] = [{ id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true }];
const sort = { columnId: 'name', direction: 'descending' } as const;
let user: ReturnType<typeof userEvent.setup>;
let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;

beforeEach(() => {
  vi.mocked(downloadFile).mockClear();
  user = userEvent.setup();
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

async function choose(name: string) {
  await user.click(screen.getByRole('button', { name: 'Export' }));
  await user.click(await screen.findByRole('menuitem', { name }));
}

it('downloads every client row in sort order across pages with a caption filename and BOM', async () => {
  render(<DataTable rows={rows} columns={columns} caption="Deployments" csvExport defaultSort={sort} />);
  await choose('All rows (95)');
  expect(downloadFile).toHaveBeenCalledOnce();
  const expected = '\uFEFFName\r\n' + Array.from({ length: 95 }, (_, index) => `Item ${95 - index}`).join('\r\n');
  expect(downloadFile).toHaveBeenCalledWith(expected, 'deployments.csv', 'text/csv;charset=utf-8');
});

it('exports the current page and selections spanning pages in sort order', async () => {
  render(<DataTable rows={rows} columns={columns} csvExport defaultSort={sort} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 95' }));
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 85' }));
  await choose('Current page');
  expect(downloadFile).toHaveBeenLastCalledWith(
    '\uFEFFName\r\nItem 85\r\nItem 84\r\nItem 83\r\nItem 82\r\nItem 81\r\nItem 80\r\nItem 79\r\nItem 78\r\nItem 77\r\nItem 76',
    'table.csv',
    'text/csv;charset=utf-8',
  );
  await choose('Selected rows (2)');
  expect(downloadFile).toHaveBeenLastCalledWith(
    '\uFEFFName\r\nItem 95\r\nItem 85',
    'table.csv',
    'text/csv;charset=utf-8',
  );
});

it('resolves an exclude selection and respects allowed scopes and filenames', async () => {
  render(
    <DataTable
      rows={rows.slice(0, 3)}
      columns={columns}
      caption=""
      csvExport={{ scopes: ['selected'] }}
      selectionModel={{ type: 'exclude', ids: ['2'] }}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Export' }));
  expect(screen.queryByRole('menuitem', { name: /All rows|Current page/ })).not.toBeInTheDocument();
  await user.click(await screen.findByRole('menuitem', { name: 'Selected rows (2)' }));
  expect(downloadFile).toHaveBeenLastCalledWith(
    '\uFEFFName\r\nItem 1\r\nItem 3',
    'table.csv',
    'text/csv;charset=utf-8',
  );
});

it('exports the selectedId in single mode', async () => {
  render(
    <DataTable
      rows={rows}
      columns={columns}
      selectionMode="single"
      legend="Choose item"
      defaultSelectedId="15"
      csvExport={{ fileName: 'chosen.csv' }}
    />,
  );
  await choose('Selected rows (1)');
  expect(downloadFile).toHaveBeenLastCalledWith('\uFEFFName\r\nItem 15', 'chosen.csv', 'text/csv;charset=utf-8');
});

it('hides selected actions until there is a selection', async () => {
  render(<DataTable rows={rows} columns={columns} csvExport />);
  await user.click(screen.getByRole('button', { name: 'Export' }));
  expect(screen.queryByRole('menuitem', { name: /Selected rows|Copy selected/ })).not.toBeInTheDocument();
});

it('exports visible eligible columns in display order using raw values and exportValue', async () => {
  const data = [
    { id: '1', name: 'display', date: new Date('2026-10-17T08:30:00Z'), active: true, empty: null, number: 1234.5 },
  ];
  type Values = (typeof data)[number];
  const valueColumns: DataTableColumn<Values>[] = [
    { id: 'name', header: 'Name', accessor: (row) => row.name, exportValue: () => 'raw' },
    { id: 'date', header: 'Date', accessor: (row) => row.date },
    { id: 'active', header: 'Active', accessor: (row) => row.active },
    { id: 'empty', header: 'Empty', accessor: (row) => row.empty },
    { id: 'number', header: 'Number', accessor: (row) => row.number },
    { id: 'computed', header: 'Computed', exportValue: () => 42 },
    { id: 'hidden', header: 'Hidden', defaultHidden: true, accessor: () => 'omit' },
    { id: 'private', header: 'Private', exportable: false, accessor: () => 'omit' },
    { id: 'actions', header: 'Actions', cell: () => 'Open' },
  ];
  render(<DataTable rows={data} columns={valueColumns} pinnedColumns={{ left: ['computed'] }} csvExport />);
  await choose('All rows (1)');
  expect(downloadFile).toHaveBeenLastCalledWith(
    '\uFEFFComputed,Name,Date,Active,Empty,Number\r\n42,raw,2026-10-17T08:30:00.000Z,true,,1234.5',
    'table.csv',
    'text/csv;charset=utf-8',
  );
});

it.each(['rows', 'page', 'selected'] as const)(
  'delegates %s once with visible exported ids, selection, sort and filters',
  async (scope) => {
    const onExport = vi.fn();
    const filters = { status: 'active' };
    render(
      <DataTable
        rows={rows}
        columns={[...columns, { id: 'private', header: 'Private', accessor: () => 'secret', exportable: false }]}
        csvExport
        onExport={onExport}
        defaultSelectedIds={['2', '15']}
        sort={sort}
        filters={filters}
      />,
    );
    await choose({ rows: 'All rows (95)', page: 'Current page', selected: 'Selected rows (2)' }[scope]);
    expect(onExport).toHaveBeenCalledExactlyOnceWith({
      scope,
      columns: ['name'],
      selectedIds: ['2', '15'],
      sort,
      filters,
    });
    expect(downloadFile).not.toHaveBeenCalled();
  },
);

it('locks the export trigger while a delegated promise is pending and releases it afterwards', async () => {
  let resolve!: () => void;
  const onExport = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  render(<DataTable rows={rows} columns={columns} csvExport onExport={onExport} />);
  await choose('All rows (95)');
  const trigger = screen.getByRole('button', { name: 'Export' });
  expect(trigger).toHaveAttribute('aria-busy', 'true');
  await user.click(trigger);
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(onExport).toHaveBeenCalledOnce();
  await act(async () => resolve());
  expect(trigger).not.toHaveAttribute('aria-busy', 'true');
  await choose('Current page');
  expect(onExport).toHaveBeenCalledTimes(2);
  await act(async () => resolve());
});

it('offers server export only with a delegate and reports the total count', async () => {
  const props = {
    rows: rows.slice(10, 20),
    columns,
    paginationMode: 'server' as const,
    page: 2,
    pageSize: 10,
    rowCount: 95,
    csvExport: true,
  };
  const { rerender } = render(<DataTable {...props} />);
  expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
  const onExport = vi.fn();
  rerender(<DataTable {...props} onExport={onExport} selectedIds={['2', '15']} />);
  await choose('All rows (95)');
  expect(onExport).toHaveBeenCalledExactlyOnceWith({
    scope: 'rows',
    columns: ['name'],
    selectedIds: ['2', '15'],
    sort: null,
    filters: undefined,
  });
  expect(downloadFile).not.toHaveBeenCalled();
});

it.each([
  ['=x', "'=x", "'=x"],
  ['+x', "'+x", "'+x"],
  ['-x', "'-x", "'-x"],
  ['@x', "'@x", "'@x"],
  ['\tx', "'\tx", '"\'\tx"'],
  ['\rx', '"\'\rx"', '"\'\rx"'],
  [
    '=HYPERLINK("https://example.test","x")',
    '"\'=HYPERLINK(""https://example.test"",""x"")"',
    '"\'=HYPERLINK(""https://example.test"",""x"")"',
  ],
])('protects %j in CSV and copied TSV headers, accessors and exportValue', async (value, csv, tsv) => {
  render(
    <DataTable
      rows={[{ id: '1', name: value }]}
      columns={[
        { id: 'name', header: value, accessor: (row) => row.name },
        { id: 'override', header: 'Override', accessor: () => 'safe', exportValue: () => value },
      ]}
      csvExport
      defaultSelectedIds={['1']}
    />,
  );
  await choose('All rows (1)');
  expect(downloadFile).toHaveBeenCalledWith(
    `\uFEFF${csv},Override\r\n${csv},${csv}`,
    'table.csv',
    'text/csv;charset=utf-8',
  );
  await choose('Copy selected rows');
  expect(writeText).toHaveBeenCalledExactlyOnceWith(`${tsv}\tOverride\r\n${tsv}\t${tsv}`);
  expect(await screen.findByRole('status')).toHaveTextContent('Copied to clipboard');
});

it('copies the selected rows across pages with headers in sort order', async () => {
  render(<DataTable rows={rows} columns={columns} defaultSelectedIds={['2', '15']} sort={sort} csvExport />);
  await choose('Copy selected rows');
  expect(writeText).toHaveBeenCalledExactlyOnceWith('Name\r\nItem 15\r\nItem 2');
});

it('announces clipboard rejection', async () => {
  writeText.mockRejectedValue(new Error('denied'));
  render(<DataTable rows={rows} columns={columns} defaultSelectedIds={['2']} csvExport />);
  await choose('Copy selected rows');
  expect(await screen.findByRole('status')).toHaveTextContent('Copy failed');
});

it.each(['ctrlKey', 'metaKey'] as const)(
  'copies with %s+C from a checkbox, row actions or a cell',
  async (modifier) => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        csvExport
        defaultSelectedIds={['2', '15']}
        sort={sort}
        rowActions={() => [{ label: 'Inspect' }]}
      />,
    );
    const targets = [
      screen.getByRole('checkbox', { name: 'Select Item 95' }),
      screen.getByRole('button', { name: 'Actions for Item 95' }),
      screen.getByRole('cell', { name: 'Item 95' }),
    ];
    for (const target of targets) {
      target.setAttribute('tabindex', '0');
      target.focus();
      expect(fireEvent.keyDown(target, { key: 'c', [modifier]: true })).toBe(false);
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith('Name\r\nItem 15\r\nItem 2'));
    }
    expect(writeText).toHaveBeenCalledTimes(3);
  },
);

it.each(['input', 'textarea', 'select', 'contenteditable'] as const)(
  'leaves copy in %s to the browser',
  async (editor) => {
    render(
      <DataTable
        rows={rows.slice(0, 1)}
        columns={[
          {
            ...columns[0]!,
            cell: () =>
              editor === 'contenteditable' ? (
                <div contentEditable suppressContentEditableWarning>
                  <span>Editor text</span>
                </div>
              ) : editor === 'input' ? (
                <input aria-label="Editor" />
              ) : editor === 'textarea' ? (
                <textarea aria-label="Editor" />
              ) : (
                <select aria-label="Editor">
                  <option>One</option>
                </select>
              ),
          },
        ]}
        csvExport
        defaultSelectedIds={['1']}
      />,
    );
    const target = editor === 'contenteditable' ? screen.getByText('Editor text') : screen.getByLabelText('Editor');
    expect(fireEvent.keyDown(target, { key: 'c', ctrlKey: true })).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
  },
);

it('uses the Spanish catalog for the entire export menu and copy feedback', async () => {
  render(
    <I18nProvider locale="es">
      <DataTable rows={rows} columns={columns} csvExport defaultSelectedIds={['2']} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Exportar' }));
  expect(await screen.findByRole('menuitem', { name: 'Todas las filas (95)' })).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'Página actual' })).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'Filas seleccionadas (1)' })).toBeVisible();
  await user.click(screen.getByRole('menuitem', { name: 'Copiar filas seleccionadas' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Copiado al portapapeles');
});

it.each([false, true])('prefers DataTableLabels for every export string (copy rejects=%s)', async (rejects) => {
  if (rejects) writeText.mockRejectedValue(new Error('denied'));
  render(
    <I18nProvider locale="es">
      <DataTable
        rows={rows}
        columns={columns}
        csvExport
        defaultSelectedIds={['2']}
        labels={{
          export: 'Save data',
          exportAll: (count) => `Everything (${count})`,
          exportPage: 'This page',
          exportSelected: (count) => `Chosen (${count})`,
          copySelected: 'Copy chosen',
          copiedToClipboard: 'Copied chosen',
          copyFailed: 'Cannot copy chosen',
        }}
      />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Save data' }));
  expect(await screen.findByRole('menuitem', { name: 'Everything (95)' })).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'This page' })).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'Chosen (1)' })).toBeVisible();
  await user.click(screen.getByRole('menuitem', { name: 'Copy chosen' }));
  expect(await screen.findByRole('status')).toHaveTextContent(rejects ? 'Cannot copy chosen' : 'Copied chosen');
});

it('preserves document text selection when copying in a cell', () => {
  render(<DataTable rows={rows} columns={columns} csvExport defaultSelectedIds={['2']} />);
  const cell = screen.getByRole('cell', { name: 'Item 1' });
  const selection = window.getSelection()!;
  const range = document.createRange();
  range.selectNodeContents(cell);
  selection.removeAllRanges();
  selection.addRange(range);
  expect(selection.isCollapsed).toBe(false);
  try {
    expect(fireEvent.keyDown(cell, { key: 'c', metaKey: true })).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
  } finally {
    selection.removeAllRanges();
  }
});

it.each([
  { csvExport: false, defaultSelectedIds: ['1'] },
  { csvExport: true, defaultSelectedIds: [] },
  { csvExport: { scopes: ['rows'] as Array<'rows'> }, defaultSelectedIds: ['1'] },
])('leaves browser copy alone when selected copying is not enabled: %j', (props) => {
  render(<DataTable rows={rows} columns={columns} {...props} />);
  expect(fireEvent.keyDown(screen.getByRole('cell', { name: 'Item 1' }), { key: 'c', ctrlKey: true })).toBe(true);
  expect(writeText).not.toHaveBeenCalled();
});

it('slugs a supplied caption for the default filename', async () => {
  render(<DataTable rows={rows.slice(0, 1)} columns={columns} caption=" Deployment history / 2026 " csvExport />);
  await choose('All rows (1)');
  expect(downloadFile).toHaveBeenCalledWith(
    '\uFEFFName\r\nItem 1',
    'deployment-history-2026.csv',
    'text/csv;charset=utf-8',
  );
});

it('preserves the toolbar DOM and hidden-toolbar behaviour without csvExport', () => {
  const { container, rerender } = render(
    <DataTable rows={rows} columns={columns} showColumnMenu={false} showDensityToggle={false} />,
  );
  const toolbar = container.firstElementChild!.firstElementChild!;
  const original = toolbar.outerHTML;
  expect(toolbar).toHaveClass('sr-only');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(
    <DataTable rows={rows} columns={columns} showColumnMenu={false} showDensityToggle={false} csvExport={false} />,
  );
  expect(toolbar.outerHTML).toBe(original);
  rerender(<DataTable rows={rows} columns={columns} showColumnMenu={false} showDensityToggle={false} csvExport />);
  expect(toolbar).not.toHaveClass('sr-only');
  expect(screen.getByRole('button', { name: 'Export' })).toBeVisible();
  rerender(<DataTable rows={rows} columns={columns} showColumnMenu={false} showDensityToggle={false} />);
  expect(toolbar.outerHTML).toBe(original);
});

it.each(['dark', 'light', 'high_contrast'])('has accessible export examples and an open menu in %s', async (theme) => {
  document.documentElement.className = theme;
  render(<CsvExportExample />);
  await expectNoAxeViolations(document.body);
  await user.click(screen.getAllByRole('button', { name: 'Export' })[0]!);
  await screen.findByRole('menuitem', { name: 'Copy selected rows' });
  await expectNoAxeViolations(document.body);
});

it('unlocks exports after a delegated rejection', async () => {
  const onExport = vi.fn().mockRejectedValue(new Error('caller handles feedback'));
  render(<DataTable rows={rows} columns={columns} csvExport onExport={onExport} />);
  await choose('All rows (95)');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).not.toHaveAttribute('aria-busy', 'true'));
  await choose('Current page');
  expect(onExport).toHaveBeenCalledTimes(2);
  expect(downloadFile).not.toHaveBeenCalled();
});

it('copies an exclude selection and omits grouped header rows', async () => {
  render(
    <DataTable
      rows={rows.slice(0, 3)}
      columns={columns}
      csvExport
      selectionModel={{ type: 'exclude', ids: ['2'] }}
      groupBy={() => 'Group heading'}
    />,
  );
  await choose('Copy selected rows');
  expect(writeText).toHaveBeenCalledExactlyOnceWith('Name\r\nItem 1\r\nItem 3');
  await choose('All rows (3)');
  expect(downloadFile).toHaveBeenCalledWith(
    '\uFEFFName\r\nItem 1\r\nItem 2\r\nItem 3',
    'table.csv',
    'text/csv;charset=utf-8',
  );
});

it('counts resolved client selections when an excluded id has left the supplied rows', async () => {
  render(
    <DataTable
      rows={rows.slice(0, 2)}
      columns={columns}
      csvExport
      selectionModel={{ type: 'exclude', ids: ['removed'] }}
    />,
  );
  await choose('Selected rows (2)');
  expect(downloadFile).toHaveBeenCalledWith('\uFEFFName\r\nItem 1\r\nItem 2', 'table.csv', 'text/csv;charset=utf-8');
});
