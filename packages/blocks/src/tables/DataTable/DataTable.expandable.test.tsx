import ExpandableRows from './examples/expandable-rows';
import { useEffect } from 'react';
import { I18nProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import { tableLayout } from './column-sizing';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';

const rows = [
  { id: 'inv-42', status: 'failed' },
  { id: 'inv-43', status: 'succeeded' },
];
const columns = [{ id: 'id', header: 'Invocation', accessor: (r: (typeof rows)[number]) => r.id, sortable: true }];
const base = { rows, columns, getRowLabel: (r: (typeof rows)[number]) => r.id, paginated: false };

it('opens a named full-width region immediately after its row and supports keyboard focus', async () => {
  const user = userEvent.setup();
  const { container } = render(
    <DataTable
      {...base}
      columns={[
        ...columns,
        { id: 'control', header: 'Control', cell: (row) => <button type="button">{row.id} control</button> },
      ]}
      renderDetail={(r) => <a href="#payload">{r.id} payload</a>}
    />,
  );
  const toggle = screen.getByRole('button', { name: 'Details for inv-42' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  toggle.focus();
  await user.keyboard('{Enter}');
  const panel = screen.getByRole('region', { name: 'Details for inv-42' });
  expect(toggle).toHaveFocus();
  expect(toggle).toHaveAttribute('aria-controls', panel.id);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const detail = panel.closest('tr')!;
  expect(detail).toHaveAttribute('data-detail-row');
  expect(toggle.closest('tr')!.nextElementSibling).toBe(detail);
  expect(within(detail).getAllByRole('cell')).toHaveLength(1);
  expect(within(detail).getByRole('cell')).toHaveAttribute(
    'colspan',
    String(screen.getAllByRole('columnheader').length),
  );
  await user.tab();
  expect(screen.getByRole('button', { name: 'inv-42 control' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('link', { name: 'inv-42 payload' })).toHaveFocus();
  toggle.focus();
  await user.keyboard(' ');
  expect(container.querySelector('[data-detail-row]')).toBeNull();
  expect(toggle).toHaveFocus();
});

it.each([true, 'auto'] as const)('disables %s virtualization for detail rows', (virtualize) => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const { container, rerender } = render(
      <DataTable
        {...base}
        rows={Array.from({ length: 500 }, (_, i) => ({ id: `inv-${i}`, status: 'failed' }))}
        virtualize={virtualize}
        renderDetail={(r) => r.id}
      />,
    );
    expect(container.querySelectorAll('[data-row-id]')).toHaveLength(500);
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-rowcount');
    if (virtualize === true) {
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toMatch(/renderDetail.*measured heights/);
      rerender(<DataTable {...base} virtualize renderDetail={(r) => r.id} />);
      expect(warn).toHaveBeenCalledTimes(1);
    } else expect(warn).not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
  }
});

it('limits eligibility and never renders an ineligible controlled detail', () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ id: `inv-${i}`, status: i < 2 ? 'failed' : 'succeeded' }));
  const { container } = render(
    <DataTable
      {...base}
      rows={many}
      hasDetail={(r) => r.status === 'failed'}
      renderDetail={(r) => r.id}
      expandedDetailIds={['inv-4']}
    />,
  );
  expect(screen.getAllByRole('button', { name: /^Details for/ })).toHaveLength(2);
  expect(container.querySelectorAll('[data-detail-row]')).toHaveLength(0);
  expect(container.querySelector('[data-row-id="inv-4"]')?.children[1]).toBeEmptyDOMElement();
});

it('waits for controlled props and reports single or multiple next ids', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const props = { ...base, renderDetail: (r: (typeof rows)[number]) => r.id, onExpandedDetailIdsChange: change };
  const { rerender } = render(<DataTable {...props} expandedDetailIds={['inv-42']} />);
  await user.click(screen.getByRole('button', { name: 'Details for inv-43' }));
  expect(change).toHaveBeenLastCalledWith(['inv-42', 'inv-43']);
  expect(screen.queryByRole('region', { name: 'Details for inv-43' })).toBeNull();
  rerender(<DataTable {...props} expandedDetailIds={['inv-42']} detailExpandMode="single" />);
  await user.click(screen.getByRole('button', { name: 'Details for inv-43' }));
  expect(change).toHaveBeenLastCalledWith(['inv-43']);
  rerender(<DataTable {...props} expandedDetailIds={['inv-43']} detailExpandMode="single" />);
  expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
  expect(screen.getByRole('region', { name: 'Details for inv-43' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Details for inv-43' }));
  expect(change).toHaveBeenLastCalledWith([]);
});

it('mounts lazily, unmounts on collapse and replaces uncontrolled panels in single mode', async () => {
  const user = userEvent.setup();
  const cleanup = vi.fn();
  function Content() {
    useEffect(() => cleanup, []);
    return <p>Payload</p>;
  }
  const renderDetail = vi.fn((row: (typeof rows)[number]) => <Content key={row.id} />);
  render(<DataTable {...base} renderDetail={renderDetail} detailExpandMode="single" />);
  expect(renderDetail).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Details for inv-42' }));
  expect(renderDetail.mock.calls.every((call) => call[0] === rows[0])).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Details for inv-43' }));
  expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
  expect(cleanup).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole('button', { name: 'Details for inv-43' }));
  expect(cleanup).toHaveBeenCalledTimes(2);
});

it('retains uncontrolled ids across pages and sorting with stable panel ids', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      {...base}
      paginated
      defaultPageSize={1}
      defaultExpandedDetailIds={['inv-42']}
      renderDetail={(r) => r.id}
    />,
  );
  const id = screen.getByRole('region', { name: 'Details for inv-42' }).id;
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Previous page' }));
  expect(screen.getByRole('region', { name: 'Details for inv-42' })).toHaveAttribute('id', id);
  await user.click(screen.getByRole('button', { name: 'Invocation' }));
  expect(screen.getByRole('region', { name: 'Details for inv-42' })).toHaveAttribute('id', id);
});

it('excludes row controls, links, inputs and editable cells from row-click toggling', async () => {
  const user = userEvent.setup();
  const action = vi.fn();
  const selection = vi.fn();
  render(
    <DataTable
      {...base}
      detailOnRowClick
      renderDetail={(r) => r.id}
      onSelectionChange={selection}
      onCellEdit={() => {}}
      rowActions={() => [{ label: 'Inspect', onSelect: action }]}
      columns={[
        ...columns,
        { id: 'status', header: 'Status', accessor: (r) => r.status, editable: true },
        {
          id: 'controls',
          header: 'Controls',
          cell: () => (
            <>
              <a href="#test">Link</a>
              <input aria-label="Note" />
              <select aria-label="Option">
                <option>A</option>
              </select>
              <textarea aria-label="Text" />
            </>
          ),
        },
      ]}
    />,
  );
  const row = screen.getByRole('checkbox', { name: 'Select inv-42' }).closest('tr')!;
  await user.click(within(row).getByRole('checkbox'));
  expect(selection).toHaveBeenLastCalledWith(['inv-42']);
  expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
  for (const el of [
    within(row).getByRole('link'),
    within(row).getByRole('textbox', { name: 'Note' }),
    within(row).getByRole('combobox'),
    within(row).getByRole('textbox', { name: 'Text' }),
  ]) {
    await user.click(el);
    expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
  }
  await user.type(within(row).getByRole('textbox', { name: 'Note' }), 'works');
  expect(within(row).getByRole('textbox', { name: 'Note' })).toHaveValue('works');
  await user.click(within(row).getByText('failed').closest('td')!);
  expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
  await user.click(within(row).getByText('failed'));
  expect(within(row).getByRole('textbox', { name: /Status/ })).toBeVisible();
  await user.keyboard('{Escape}');
  await user.click(within(row).getByRole('button', { name: 'Actions for inv-42' }));
  expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
  await user.click(await screen.findByRole('menuitem', { name: 'Inspect' }));
  expect(action).toHaveBeenCalled();
  expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
  await user.click(within(row).getByText('inv-42'));
  expect(screen.getByRole('region', { name: 'Details for inv-42' })).toBeVisible();
});

it('keeps details in their group and selection counts only data rows', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DataTable
      {...base}
      groupBy="status"
      defaultExpandedDetailIds={['inv-42']}
      renderDetail={(r) => r.id}
      onSelectionChange={change}
    />,
  );
  const panel = screen.getByRole('region', { name: 'Details for inv-42' });
  expect(panel.closest('tbody')).toHaveAttribute('data-group', 'failed');
  await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
  expect(change).toHaveBeenLastCalledWith(['inv-42', 'inv-43']);
  await user.click(screen.getByRole('checkbox', { name: 'Select all in failed' }));
  expect(change).toHaveBeenLastCalledWith(['inv-43']);
  await user.click(screen.getByRole('button', { name: /failed 1 row/ }));
  expect(screen.queryByRole('region', { name: 'Details for inv-42' })).toBeNull();
});

it('includes the toggle in sized pin offsets at both edges', () => {
  const layout = tableLayout({
    columns: [
      { id: 'a', header: 'A', width: 100 },
      { id: 'b', header: 'B', width: 120 },
    ],
    widths: {},
    pinned: { left: ['a'], right: ['b'] },
    sized: true,
    lead: true,
    detail: true,
    trail: true,
  });
  expect(layout.columns.get('a')?.style).toMatchObject({ insetInlineStart: 80 });
  expect(layout.columns.get('b')?.style).toMatchObject({ insetInlineEnd: 48 });
  expect(layout.detail?.style).toMatchObject({ insetInlineStart: 40 });
  expect(layout.tableStyle).toEqual({ width: 348, minWidth: '100%' });
});

it('includes the toggle column in skeletons, empty spans and new-row drafts', async () => {
  const user = userEvent.setup();
  const props = { ...base, renderDetail: (r: (typeof rows)[number]) => r.id };
  const { container, rerender } = render(<DataTable {...props} loading loadingRows={1} />);
  expect(container.querySelector('tbody tr')?.children).toHaveLength(3);
  rerender(<DataTable {...props} rows={[]} />);
  expect(container.querySelector('tbody td')).toHaveAttribute('colspan', '3');
  rerender(<DataTable {...props} editMode="row" onRowAdd={() => {}} />);
  await user.click(screen.getByRole('button', { name: 'Add row' }));
  const draft = container.querySelector('tbody tr')!;
  expect(draft.children).toHaveLength(screen.getAllByRole('columnheader').length);
});

it('translates and overrides the disclosure name', () => {
  const { rerender } = render(
    <I18nProvider locale="es">
      <DataTable {...base} renderDetail={(r) => r.id} />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Detalles de inv-42' })).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <DataTable
        {...base}
        renderDetail={(r) => r.id}
        labels={{ rowDetails: (label) => `Payload ${label}` }}
        expandedDetailIds={['inv-42']}
      />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Payload inv-42' })).toBeVisible();
  expect(screen.getByRole('region', { name: 'Payload inv-42' })).toBeVisible();
});

it.each(['dark', 'light', 'high_contrast'])('has no axe violations in %s', async (theme) => {
  document.documentElement.className = theme;
  const { container } = render(
    <DataTable {...base} defaultExpandedDetailIds={['inv-42']} renderDetail={() => <a href="#payload">Payload</a>} />,
  );
  await expectNoAxeViolations(container);
});

it.each(['dark', 'light', 'high_contrast'])('renders the live example accessibly in %s', async (theme) => {
  document.documentElement.className = theme;
  const { container } = render(<ExpandableRows />);
  await expectNoAxeViolations(container);
});
