import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkProvider } from '@gntik-ai/ui';
import { useState, type ComponentPropsWithRef } from 'react';
import { flushSync } from 'react-dom';
import { DataTable } from './DataTable';

const rows = [
  { id: 'orders', name: 'orders-api', region: 'west' },
  { id: 'jobs', name: 'jobs-api', region: 'east' },
];
const columns = [
  { id: 'name', header: 'Deployment', accessor: (row: (typeof rows)[number]) => row.name, rowHeader: true },
  { id: 'region', header: 'Region', accessor: (row: (typeof rows)[number]) => row.region },
];
afterEach(() => {
  window.getSelection()?.removeAllRanges();
  vi.restoreAllMocks();
});
const href = (row: (typeof rows)[number]) => `/deployments/${row.id}`;

it('follows the row header through the router exactly once, with no destination leaving a row inert', async () => {
  const navigate = vi.fn();
  function RouterLink({ onClick, ...props }: ComponentPropsWithRef<'a'>) {
    return (
      <a
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) navigate(props.href);
          event.preventDefault();
        }}
      />
    );
  }
  render(
    <LinkProvider component={RouterLink}>
      <DataTable rows={rows} columns={columns} getRowHref={(row) => (row.id === 'orders' ? href(row) : undefined)} />
    </LinkProvider>,
  );
  expect(within(screen.getByRole('rowheader', { name: 'orders-api' })).getByRole('link')).toHaveAttribute(
    'href',
    '/deployments/orders',
  );
  await userEvent.click(screen.getByText('west'));
  expect(navigate).toHaveBeenCalledExactlyOnceWith('/deployments/orders');
  const inert = screen.getByText('east').closest('tr')!;
  expect(inert).not.toHaveClass('cursor-pointer');
  expect(within(inert).queryByRole('link')).not.toBeInTheDocument();
  await userEvent.click(screen.getByText('east'));
  expect(navigate).toHaveBeenCalledTimes(1);
});

it('activates a plain anchor once and opens only modified or middle row clicks in a new tab', () => {
  const navigate = vi.fn();
  const open = vi.spyOn(window, 'open').mockImplementation(() => null);
  render(<DataTable rows={rows} columns={columns} getRowHref={href} />);
  const anchor = screen.getByRole('link', { name: 'orders-api' });
  anchor.addEventListener('click', (event) => {
    event.preventDefault();
    navigate();
  });
  fireEvent.click(screen.getByText('west'));
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('west'), { ctrlKey: true });
  fireEvent.click(screen.getByText('west'), { metaKey: true });
  fireEvent(screen.getByText('west'), new MouseEvent('auxclick', { button: 1, bubbles: true }));
  expect(open).toHaveBeenCalledTimes(3);
  expect(open).toHaveBeenLastCalledWith('/deployments/orders', '_blank', 'noopener');
  expect(navigate).toHaveBeenCalledTimes(1);
  open.mockRestore();
});

it('offers a keyboard button and calls the callback once on Enter, Space and plain cells', async () => {
  const onRowClick = vi.fn();
  const user = userEvent.setup();
  render(
    <DataTable
      rows={rows}
      columns={columns}
      selectable={false}
      showColumnMenu={false}
      showDensityToggle={false}
      paginated={false}
      onRowClick={onRowClick}
    />,
  );
  await user.tab();
  expect(screen.getByRole('button', { name: 'orders-api' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(onRowClick).toHaveBeenCalledTimes(1);
  await user.keyboard(' ');
  expect(onRowClick).toHaveBeenCalledTimes(2);
  await user.click(screen.getByText('west'));
  expect(onRowClick).toHaveBeenCalledTimes(3);
  expect(onRowClick.mock.calls[0]?.[0]).toBe(rows[0]);
  expect(screen.getByText('west').closest('tr')).not.toHaveAttribute('tabindex');
});

it('runs the callback before navigation, supports cancellation and does not reenter on the synthetic link click', () => {
  const navigate = vi.fn();
  const onRowClick = vi.fn((_row, event) => event.preventDefault());
  const { rerender } = render(<DataTable rows={rows} columns={columns} getRowHref={href} onRowClick={onRowClick} />);
  screen.getByRole('link', { name: 'orders-api' }).addEventListener('click', (event) => {
    event.preventDefault();
    navigate();
  });
  fireEvent.click(screen.getByText('west'));
  expect(onRowClick).toHaveBeenCalledTimes(1);
  expect(navigate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('link', { name: 'orders-api' }));
  expect(onRowClick).toHaveBeenCalledTimes(2);
  onRowClick.mockImplementation(() => {});
  rerender(<DataTable rows={rows} columns={columns} getRowHref={href} onRowClick={onRowClick} />);
  navigate.mockClear();
  fireEvent.click(screen.getByText('west'));
  expect(onRowClick).toHaveBeenCalledTimes(3);
  expect(navigate).toHaveBeenCalledTimes(1);
});

it('ignores controls, actions, editors, opt-out elements and a mouseup ending text selection', async () => {
  const onRowClick = vi.fn();
  const navigate = vi.fn();
  render(
    <DataTable
      rows={rows}
      columns={[
        ...columns,
        {
          id: 'controls',
          header: 'Controls',
          cell: () => (
            <>
              <span data-row-click-ignore>Ignore me</span>
              <span role="button" tabIndex={0}>
                Custom control
              </span>
              <label>Label</label>
              <span role="menuitem">Menu item</span>
              <span contentEditable suppressContentEditableWarning>
                Editable
              </span>
            </>
          ),
        },
        { id: 'edit', header: 'Edit', accessor: (row) => row.region, editable: true },
      ]}
      getRowHref={href}
      onRowClick={onRowClick}
      onCellEdit={() => {}}
      rowActions={() => [{ label: 'Inspect', onClick: vi.fn() }]}
    />,
  );
  const row = screen.getByText('west', { selector: 'td' }).closest('tr')!;
  within(row)
    .getByRole('link')
    .addEventListener('click', (event) => {
      event.preventDefault();
      navigate();
    });
  await userEvent.click(within(row).getByRole('checkbox'));
  await userEvent.click(within(row).getByRole('button', { name: /Actions/ }));
  await userEvent.keyboard('{Escape}');
  for (const name of ['Ignore me', 'Custom control', 'Label', 'Menu item', 'Editable'])
    fireEvent.click(within(row).getByText(name));
  const edit = within(row).getByRole('button', { name: 'west' });
  await userEvent.click(edit);
  const editor = within(row).getByRole('textbox');
  await userEvent.click(editor);
  await userEvent.keyboard('{Escape}');
  const cell = within(row).getByText('west', { selector: 'td' });
  const selection = window.getSelection()!;
  const range = document.createRange();
  range.selectNodeContents(cell);
  selection.removeAllRanges();
  selection.addRange(range);
  expect(selection.toString()).toBe('west');
  fireEvent.mouseUp(cell);
  fireEvent.click(cell);
  expect(selection.toString()).toBe('west');
  expect(onRowClick).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  selection.removeAllRanges();
});

it('ignores default-prevented cell events and only double clicks plain content', async () => {
  const onRowClick = vi.fn();
  const onRowDoubleClick = vi.fn();
  render(
    <DataTable
      rows={rows}
      columns={[
        ...columns,
        {
          id: 'cancel',
          header: 'Cancel',
          cell: () => <span onClick={(event) => event.preventDefault()}>Cancel event</span>,
        },
      ]}
      onRowClick={onRowClick}
      onRowDoubleClick={onRowDoubleClick}
    />,
  );
  fireEvent.click(screen.getAllByText('Cancel event')[0]!);
  expect(onRowClick).not.toHaveBeenCalled();
  await userEvent.dblClick(screen.getByText('west'));
  expect(onRowDoubleClick).toHaveBeenCalledExactlyOnceWith(rows[0], expect.anything());
  await userEvent.dblClick(screen.getByRole('button', { name: 'orders-api' }));
  await userEvent.keyboard('{Enter} ');
  expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
});

it('toggles multiple selection and skips disabled rows', async () => {
  const onSelectionChange = vi.fn();
  render(
    <DataTable
      rows={[...rows, { id: 'disabled', name: 'disabled', region: 'north' }]}
      columns={columns}
      selectOnRowClick
      isRowDisabled={(row) => row.id === 'disabled'}
      onSelectionChange={onSelectionChange}
    />,
  );
  await userEvent.click(screen.getByText('west'));
  await userEvent.click(screen.getByText('east'));
  expect(onSelectionChange).toHaveBeenCalledTimes(2);
  expect(onSelectionChange).toHaveBeenLastCalledWith(['orders', 'jobs']);
  expect(screen.getByRole('checkbox', { name: 'Select orders-api' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Select jobs-api' })).toBeChecked();
  await userEvent.click(screen.getByText('north'));
  expect(onSelectionChange).toHaveBeenCalledTimes(2);
});

it('selects a single radio and ignores radio clicks for row callbacks', async () => {
  const onSelectedIdChange = vi.fn();
  const { rerender } = render(
    <DataTable
      rows={rows}
      columns={columns}
      selectionMode="single"
      legend="Deployments"
      selectOnRowClick
      onSelectedIdChange={onSelectedIdChange}
    />,
  );
  await userEvent.click(screen.getByText('east'));
  expect(screen.getByRole('radio', { name: 'jobs-api' })).toBeChecked();
  expect(onSelectedIdChange).toHaveBeenCalledExactlyOnceWith('jobs');
  const onRowClick = vi.fn();
  rerender(
    <DataTable rows={rows} columns={columns} selectionMode="single" legend="Deployments" onRowClick={onRowClick} />,
  );
  await userEvent.click(screen.getByRole('radio', { name: 'orders-api' }));
  expect(onRowClick).not.toHaveBeenCalled();
});

it('gives activation precedence over row selection and details with one development warning per table', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const onSelectionChange = vi.fn();
  const onExpandedDetailIdsChange = vi.fn();
  const props = {
    rows,
    columns,
    getRowHref: href,
    selectOnRowClick: true,
    detailOnRowClick: true,
    renderDetail: () => 'Details',
    onSelectionChange,
    onExpandedDetailIdsChange,
  };
  const { rerender } = render(<DataTable {...props} />);
  const navigate = vi.fn();
  screen.getByRole('link', { name: 'orders-api' }).addEventListener('click', (event) => {
    event.preventDefault();
    navigate();
  });
  fireEvent.click(screen.getByText('west'));
  rerender(<DataTable {...props} />);
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(onSelectionChange).not.toHaveBeenCalled();
  expect(onExpandedDetailIdsChange).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toMatch(/selectOnRowClick.*detailOnRowClick/);
  warn.mockRestore();
});

it('preserves a text selection ending on the identifying link without navigating', () => {
  const navigate = vi.fn();
  const onRowClick = vi.fn();
  function RouterLink({ onClick, ...props }: ComponentPropsWithRef<'a'>) {
    return (
      <a
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) navigate();
          event.preventDefault();
        }}
      />
    );
  }
  render(
    <LinkProvider component={RouterLink}>
      <DataTable rows={rows} columns={columns} getRowHref={href} onRowClick={onRowClick} />
    </LinkProvider>,
  );
  const link = screen.getByRole('link', { name: 'orders-api' });
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(link);
  selection.addRange(range);
  fireEvent.mouseUp(link);
  fireEvent.click(link);
  expect(navigate).not.toHaveBeenCalled();
  expect(onRowClick).not.toHaveBeenCalled();
  expect(selection.toString()).toBe('orders-api');
});

it.each([false, true])('uses the first visible column when the row header is absent or hidden (%s)', (hidden) => {
  const navigate = vi.fn();
  render(
    <DataTable
      rows={rows}
      columns={columns.map((column) => ({ ...column, rowHeader: hidden ? column.rowHeader : false }))}
      hiddenColumns={hidden ? ['name'] : []}
      getRowHref={href}
    />,
  );
  const link = screen.getByRole('link', { name: hidden ? 'west' : 'orders-api' });
  link.addEventListener('click', (event) => {
    event.preventDefault();
    navigate();
  });
  fireEvent.click(link.closest('tr')!);
  expect(navigate).toHaveBeenCalledTimes(1);
});

it('does not call onRowClick twice when it synchronously rerenders the table before following its link', () => {
  const onRowClick = vi.fn();
  const navigate = vi.fn();
  function Example() {
    const [count, setCount] = useState(0);
    return (
      <DataTable
        rows={rows}
        columns={columns}
        caption={`Deployments ${count}`}
        getRowHref={href}
        onRowClick={() => {
          onRowClick();
          flushSync(() => setCount((value) => value + 1));
        }}
      />
    );
  }
  render(<Example />);
  screen.getByRole('link', { name: 'orders-api' }).addEventListener('click', (event) => {
    event.preventDefault();
    navigate();
  });
  fireEvent.click(screen.getByText('west'));
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(onRowClick).toHaveBeenCalledTimes(1);
});
