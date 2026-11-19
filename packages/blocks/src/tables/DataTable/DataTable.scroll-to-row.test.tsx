import { act, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { DataTable, type DataTableHandle } from './DataTable';

const rows = Array.from({ length: 30 }, (_, index) => ({
  id: `id${index}`,
  name: `Deployment ${index}`,
  group: index < 20 ? 'west' : 'east',
}));
const columns = [{ id: 'name', header: 'Deployment', accessor: (row: (typeof rows)[number]) => row.name }];
const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
afterEach(() => {
  vi.restoreAllMocks();
  if (originalScrollIntoView) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
  else Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
});

it('reveals a row on client page 3 and expands its group, while missing ids change nothing', async () => {
  const ref = createRef<DataTableHandle>();
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  const onPageChange = vi.fn();
  const onCollapsedGroupsChange = vi.fn();
  render(
    <DataTable
      ref={ref}
      rows={rows}
      columns={columns}
      groupBy="group"
      defaultCollapsedGroups={['east']}
      onPageChange={onPageChange}
      onCollapsedGroupsChange={onCollapsedGroupsChange}
    />,
  );
  const container = screen.getByRole('table').parentElement!;
  container.scrollTop = 12;
  let result = true;
  act(() => {
    result = ref.current!.scrollToRow('missing');
  });
  expect(result).toBe(false);
  expect(onPageChange).not.toHaveBeenCalled();
  expect(onCollapsedGroupsChange).not.toHaveBeenCalled();
  expect(container.scrollTop).toBe(12);
  expect(scrollIntoView).not.toHaveBeenCalled();
  act(() => {
    result = ref.current!.scrollToRow('id24', { align: 'center', focus: true });
  });
  expect(result).toBe(true);
  expect(onPageChange).toHaveBeenCalledExactlyOnceWith(3);
  expect(onCollapsedGroupsChange).toHaveBeenCalledExactlyOnceWith([]);
  await waitFor(() => expect(screen.getByText('Deployment 24')).toBeVisible());
  expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'center', behavior: 'instant' });
  expect(screen.getByRole('checkbox', { name: 'Select Deployment 24' })).toHaveFocus();
});

it('requests controlled page/group updates once and waits for the consumer before scrolling', () => {
  const ref = createRef<DataTableHandle>();
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  const onPageChange = vi.fn();
  const onCollapsedGroupsChange = vi.fn();
  const props = { ref, rows, columns, groupBy: 'group' as const, onPageChange, onCollapsedGroupsChange };
  const { rerender } = render(<DataTable {...props} page={1} collapsedGroups={['east']} />);
  act(() => {
    expect(ref.current!.scrollToRow('id24')).toBe(true);
  });
  expect(onPageChange).toHaveBeenCalledExactlyOnceWith(3);
  expect(onCollapsedGroupsChange).toHaveBeenCalledExactlyOnceWith([]);
  expect(screen.queryByText('Deployment 24')).not.toBeInTheDocument();
  expect(scrollIntoView).not.toHaveBeenCalled();
  rerender(<DataTable {...props} page={3} collapsedGroups={['east']} />);
  expect(scrollIntoView).not.toHaveBeenCalled();
  rerender(<DataTable {...props} page={3} collapsedGroups={[]} />);
  expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'nearest', behavior: 'instant' });
});

it.each([
  ['center', 31764],
  ['start', 32000],
  ['end', 31528],
  ['auto', 31528],
] as const)('reveals virtual row 800 with %s alignment and focuses its first control', async (align, expected) => {
  const ref = createRef<DataTableHandle>();
  const largeRows = Array.from({ length: 1000 }, (_, index) => ({
    id: `id${index}`,
    name: `Deployment ${index}`,
    group: 'west',
  }));
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  render(<DataTable ref={ref} rows={largeRows} columns={columns} virtualize paginated={false} rowHeight={40} />);
  const container = screen.getByRole('table').parentElement!;
  expect(screen.queryByText('Deployment 800')).not.toBeInTheDocument();
  act(() => {
    expect(ref.current!.scrollToRow('id800', { align, focus: true })).toBe(true);
  });
  await waitFor(() => expect(container.scrollTop).toBe(expected));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select Deployment 800' })).toHaveFocus());
  expect(scrollIntoView).not.toHaveBeenCalled();
  // An already visible row does not move for auto alignment.
  if (align === 'auto') {
    act(() => {
      ref.current!.scrollToRow('id800');
    });
    expect(container.scrollTop).toBe(expected);
  }
  act(() => {
    expect(ref.current!.scrollToRow('missing')).toBe(false);
  });
  expect(container.scrollTop).toBe(expected);
});

it('counts virtual group headers and expands a collapsed group before calculating its offset', async () => {
  const ref = createRef<DataTableHandle>();
  render(
    <DataTable
      ref={ref}
      rows={rows}
      columns={columns}
      virtualize
      paginated={false}
      rowHeight={40}
      groupBy="group"
      defaultCollapsedGroups={['east']}
    />,
  );
  act(() => {
    ref.current!.scrollToRow('id24', { align: 'start', focus: true });
  });
  const container = screen.getByRole('table').parentElement!;
  // 24 preceding data rows and two group headers.
  await waitFor(() => expect(container.scrollTop).toBe(768)); // clamped to total height (32 * 40) minus viewport (512)
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select Deployment 24' })).toHaveFocus());
});

it('never requests an unloaded server page', () => {
  const ref = createRef<DataTableHandle>();
  const onPageChange = vi.fn();
  render(
    <DataTable
      ref={ref}
      rows={rows.slice(10, 20)}
      columns={columns}
      paginationMode="server"
      page={2}
      pageSize={10}
      rowCount={30}
      onPageChange={onPageChange}
    />,
  );
  act(() => {
    expect(ref.current!.scrollToRow('id24')).toBe(false);
  });
  expect(onPageChange).not.toHaveBeenCalled();
});

it('cancels a pending controlled reveal on the next request, including an unknown id', () => {
  const ref = createRef<DataTableHandle>();
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  const props = { ref, rows, columns, onPageChange: vi.fn() };
  const { rerender } = render(<DataTable {...props} page={1} />);
  act(() => {
    expect(ref.current!.scrollToRow('id24', { focus: true })).toBe(true);
  });
  act(() => {
    expect(ref.current!.scrollToRow('missing')).toBe(false);
  });
  expect(props.onPageChange).toHaveBeenCalledExactlyOnceWith(3);
  rerender(<DataTable {...props} page={3} />);
  expect(scrollIntoView).not.toHaveBeenCalled();
  expect(screen.getByRole('checkbox', { name: 'Select Deployment 24' })).not.toHaveFocus();
});
