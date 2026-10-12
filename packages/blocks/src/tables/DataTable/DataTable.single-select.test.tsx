import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable, type DataTableProps } from './DataTable';
import SingleSelectionExample from './examples/single-selection';

const rows = [
  { id: 'a', name: 'Alpha', disabled: false },
  { id: 'b', name: 'Beta', disabled: true },
  { id: 'c', name: 'Gamma', disabled: false },
];
const columns = [{ id: 'name', header: 'Name', accessor: (row: (typeof rows)[number]) => row.name }];
const base = { rows, columns, showColumnMenu: false, showDensityToggle: false };

// @ts-expect-error Group labels belong to single selection, not checkbox selection.
const multipleLegend: DataTableProps<(typeof rows)[number]> = { selectionMode: 'multiple', legend: 'Choices' };
// @ts-expect-error An ungrouped table cannot silently discard a radio-group label.
const noneLabel: DataTableProps<(typeof rows)[number]> = { selectionMode: 'none', 'aria-label': 'Choices' };
// @ts-expect-error The default checkbox mode does not provide a labelled radio group.
const defaultLabelledBy: DataTableProps<(typeof rows)[number]> = { 'aria-labelledby': 'choices-label' };
void multipleLegend;
void noneLabel;
void defaultLabelledBy;

describe('DataTable single selection', () => {
  it('provides a non-paginated list and a versions example with a checked disabled version', async () => {
    const { container } = render(<SingleSelectionExample />);
    expect(screen.getByRole('group', { name: 'Available items' })).toBeInTheDocument();
    const versions = within(screen.getByRole('group', { name: 'Available versions' }));
    expect(versions.getByRole('radio', { checked: true })).toBeDisabled();
    expect(screen.queryByRole('navigation')).toBeNull();
    await expectNoAxeViolations(container);
  });
  it('renders native radios and changes exactly one choice without checkbox or bulk selection controls', async () => {
    const user = userEvent.setup();
    const onSelectedIdChange = vi.fn();
    render(
      <DataTable
        {...base}
        selectionMode="single"
        paginated={false}
        legend="Available items"
        selectionName="items"
        defaultSelectedId="a"
        onSelectedIdChange={onSelectedIdChange}
        selectedIds={['a']}
        bulkActions={() => <button>Bulk action</button>}
      />,
    );
    const group = screen.getByRole('group', { name: 'Available items' });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    for (const radio of radios) {
      expect(radio.tagName).toBe('INPUT');
      expect(radio).toHaveAttribute('type', 'radio');
      expect(radio).toHaveAttribute('name', 'items');
    }
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByText(/selected/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Bulk action' })).toBeNull();
    await user.click(screen.getByRole('radio', { name: 'Gamma' }));
    expect(screen.getByRole('radio', { name: 'Alpha' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Gamma' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Gamma' }).closest('tr')).toHaveAttribute('data-selected');
    expect(onSelectedIdChange.mock.calls).toEqual([['c']]);
  });

  it('uses one tab stop, skips disabled choices, wraps arrows and leaves the group with Tab', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <button>Before</button>
        <DataTable
          {...base}
          selectionMode="single"
          legend="Choices"
          defaultSelectedId="a"
          isRowDisabled={(row) => row.disabled}
          onSelectedIdChange={change}
        />
        <button>After</button>
      </>,
    );
    const alpha = screen.getByRole('radio', { name: 'Alpha' });
    const beta = screen.getByRole('radio', { name: 'Beta' });
    const gamma = screen.getByRole('radio', { name: 'Gamma' });
    expect(beta).toBeDisabled();
    await user.click(beta);
    expect(change).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await user.tab();
    expect(alpha).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(gamma).toHaveFocus();
    expect(gamma).toBeChecked();
    await user.keyboard('{ArrowRight}');
    expect(alpha).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(gamma).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(alpha).toHaveFocus();
    expect(change.mock.calls).toEqual([['c'], ['a'], ['c'], ['a']]);
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('enters on a checked enabled radio after the first row', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Before</button>
        <DataTable {...base} selectionMode="single" legend="Choices" defaultSelectedId="c" />
        <button>After</button>
      </>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Gamma' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
  });

  it('translates the selection column while preserving the consumer group label', () => {
    render(
      <I18nProvider locale="es">
        <DataTable {...base} selectionMode="single" legend="Choices" />
      </I18nProvider>,
    );
    expect(screen.getByRole('columnheader', { name: 'Selección' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Choices' })).toBeInTheDocument();
  });

  it('warns about duplicate supplied names and missing group labels in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { unmount } = render(
        <>
          <DataTable {...base} selectionMode="single" selectionName="duplicate-items" legend="First" />
          <DataTable {...base} selectionMode="single" selectionName="duplicate-items" legend="Second" />
          <DataTable {...base} selectionMode="single" />
        </>,
      );
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate-items'));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('legend, aria-label or aria-labelledby'));
      unmount();
      warn.mockClear();
      render(<DataTable {...base} selectionMode="single" selectionName="duplicate-items" legend="New" />);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
      vi.unstubAllEnvs();
    }
  });

  it('rejects pagination in types and warns while rendering all rows if the type check is bypassed', () => {
    // @ts-expect-error Single selection cannot be paginated.
    const invalid: DataTableProps<(typeof rows)[number]> = {
      ...base,
      selectionMode: 'single',
      paginated: true,
      legend: 'Items',
    };
    vi.stubEnv('NODE_ENV', 'development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<DataTable {...invalid} defaultPageSize={1} virtualize={true} />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('paginated'));
      expect(screen.getAllByRole('radio')).toHaveLength(3);
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(screen.getByRole('table')).not.toHaveAttribute('data-virtualized');
    } finally {
      warn.mockRestore();
      vi.unstubAllEnvs();
    }
  });

  it('isolates generated radio names between tables', async () => {
    const user = userEvent.setup();
    render(
      <>
        <DataTable {...base} selectionMode="single" legend="First" defaultSelectedId="a" />
        <DataTable {...base} selectionMode="single" legend="Second" defaultSelectedId="c" />
      </>,
    );
    const first = within(screen.getByRole('group', { name: 'First' }));
    const second = within(screen.getByRole('group', { name: 'Second' }));
    const firstName = first.getByRole('radio', { name: 'Alpha' }).getAttribute('name');
    const secondName = second.getByRole('radio', { name: 'Alpha' }).getAttribute('name');
    expect(firstName).toBeTruthy();
    expect(secondName).toBeTruthy();
    expect(firstName).not.toBe(secondName);
    for (const radio of first.getAllByRole('radio')) expect(radio).toHaveAttribute('name', firstName!);
    for (const radio of second.getAllByRole('radio')) expect(radio).toHaveAttribute('name', secondName!);
    await user.click(first.getByRole('radio', { name: 'Gamma' }));
    await user.click(second.getByRole('radio', { name: 'Beta' }));
    expect(first.getByRole('radio', { name: 'Gamma' })).toBeChecked();
    expect(second.getByRole('radio', { name: 'Beta' })).toBeChecked();
  });

  it('uses consumer aria labels and row labels without overriding table roles', () => {
    const { rerender } = render(
      <DataTable
        {...base}
        selectionMode="single"
        aria-label="Choose an item"
        getRowLabel={(row) => `Item ${row.id}`}
      />,
    );
    expect(screen.getByRole('group', { name: 'Choose an item' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Item a' })).toBeInTheDocument();
    rerender(
      <>
        <span id="choices-label">Named choices</span>
        <DataTable {...base} selectionMode="single" aria-labelledby="choices-label" />
      </>,
    );
    const group = screen.getByRole('group', { name: 'Named choices' });
    expect(within(group).getByRole('table', { name: 'Deployments' })).not.toHaveAttribute('role');
    expect(within(group).getAllByRole('row')).toHaveLength(4);
    expect(within(group).getAllByRole('columnheader')).toHaveLength(2);
    expect(within(group).getAllByRole('cell')).toHaveLength(6);
    expect(group.querySelector('table [role]')).toBeNull();
  });

  it('selects with Space and supports controlled values including clearing', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <DataTable {...base} selectionMode="single" aria-label="Choices" selectedId={null} onSelectedIdChange={change} />,
    );
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveFocus();
    await user.keyboard(' ');
    expect(change.mock.calls).toEqual([['a']]);
    expect(screen.getByRole('radio', { name: 'Alpha' })).not.toBeChecked();
    rerender(
      <DataTable {...base} selectionMode="single" aria-label="Choices" selectedId="a" onSelectedIdChange={change} />,
    );
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Gamma' }));
    expect(change.mock.calls).toEqual([['a'], ['c']]);
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked();
    rerender(
      <DataTable {...base} selectionMode="single" aria-label="Choices" selectedId="c" onSelectedIdChange={change} />,
    );
    expect(screen.getByRole('radio', { name: 'Gamma' })).toBeChecked();
    rerender(
      <DataTable {...base} selectionMode="single" aria-label="Choices" selectedId={null} onSelectedIdChange={change} />,
    );
    expect(screen.queryByRole('radio', { checked: true })).toBeNull();
    expect(change).toHaveBeenCalledTimes(2);
  });

  it('keeps a disabled selected id and enters on the first enabled row without an automatic callback', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <DataTable
        {...base}
        selectionMode="single"
        legend="Choices"
        defaultSelectedId="a"
        isRowDisabled={(row) => row.disabled}
        onSelectedIdChange={change}
      />,
    );
    rerender(
      <DataTable
        {...base}
        rows={rows.map((row) => ({ ...row, disabled: row.id !== 'c' }))}
        selectionMode="single"
        legend="Choices"
        defaultSelectedId="a"
        isRowDisabled={(row) => row.disabled}
        onSelectedIdChange={change}
      />,
    );
    const alpha = screen.getByRole('radio', { name: 'Alpha' });
    expect(alpha).toBeChecked();
    expect(alpha).toBeDisabled();
    expect(alpha.closest('tr')).toHaveAttribute('data-selected');
    await user.click(alpha);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Gamma' })).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
    await user.keyboard(' ');
    expect(screen.getByRole('radio', { name: 'Gamma' })).toBeChecked();
    expect(change.mock.calls).toEqual([['c']]);
  });

  it('enters on the first enabled radio without selecting, and Shift+Tab exits', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <button>Before</button>
        <DataTable
          {...base}
          selectionMode="single"
          legend="Choices"
          defaultSelectedId="b"
          isRowDisabled={(row) => row.disabled}
          onSelectedIdChange={change}
        />
        <button>After</button>
      </>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked();
    expect(change).not.toHaveBeenCalled();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
  });

  it('preserves forward Tab order through headers and group controls with a checked disabled row', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <button>Before</button>
        <DataTable
          {...base}
          columns={[{ ...columns[0]!, sortable: true }]}
          selectionMode="single"
          legend="Choices"
          defaultSelectedId="b"
          isRowDisabled={(row) => row.disabled}
          onSelectedIdChange={change}
          resizable
          groupBy={() => 'Items'}
          collapsibleGroups
        />
        <button>After</button>
      </>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: /Name/ })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('separator', { name: /Name/ })).toHaveFocus();
    const resize = screen.getByRole('separator', { name: /Name/ });
    const width = Number(resize.getAttribute('aria-valuenow'));
    await user.keyboard('{ArrowRight}');
    expect(resize).toHaveFocus();
    expect(resize).toHaveAttribute('aria-valuenow', String(width + 10));
    expect(change).not.toHaveBeenCalled();
    await user.tab();
    const collapse = screen.getByRole('button', { name: /Items/ });
    expect(collapse).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked();
    expect(change).not.toHaveBeenCalled();
    await user.tab({ shift: true });
    expect(collapse).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(collapse).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveFocus();
  });

  it('skips the group when all rows are disabled and retains a checked disabled row', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <button>Before</button>
        <DataTable
          {...base}
          selectionMode="single"
          legend="Choices"
          defaultSelectedId="b"
          isRowDisabled={() => true}
          onSelectedIdChange={change}
        />
        <button>After</button>
      </>,
    );
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
      expect(radio).toHaveAttribute('tabindex', '-1');
    }
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
  });

  it('does not move pointer focus to a radio when pressing cell text with a checked disabled row', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <button>Before</button>
        <DataTable
          {...base}
          selectionMode="single"
          legend="Choices"
          defaultSelectedId="b"
          isRowDisabled={(row) => row.disabled}
          onSelectedIdChange={change}
        />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.pointer({ target: screen.getByText('Beta', { selector: 'td' }), keys: '[MouseLeft>]' });
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toHaveFocus();
    await user.pointer({ keys: '[/MouseLeft]' });
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked();
    expect(change).not.toHaveBeenCalled();
  });

  it('gives explicit selectionMode precedence and hides group checkboxes in single mode', () => {
    const { rerender } = render(<DataTable {...base} selectionMode="multiple" selectable={false} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    rerender(<DataTable {...base} selectionMode="none" selectable={true} />);
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.getAllByRole('columnheader')).toHaveLength(1);
    rerender(
      <DataTable
        {...base}
        selectionMode="single"
        selectable={false}
        legend="Choices"
        groupBy={(row) => (row.disabled ? 'Unavailable' : 'Available')}
      />,
    );
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('does not issue development warnings in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(
        <>
          <DataTable {...base} selectionMode="single" selectionName="same" />
          <DataTable {...base} selectionMode="single" selectionName="same" />
        </>,
      );
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
      vi.unstubAllEnvs();
    }
  });

  for (const theme of ['dark', 'light', 'high_contrast']) {
    for (const allDisabled of [false, true]) {
      it(`has no axe violations in ${theme} with ${allDisabled ? 'all disabled' : 'mixed'} rows`, async () => {
        document.documentElement.className = theme === 'light' ? '' : theme;
        const { container } = render(
          <DataTable
            {...base}
            selectionMode="single"
            legend="Available versions"
            defaultSelectedId="b"
            isRowDisabled={(row) => allDisabled || row.disabled}
          />,
        );
        await expectNoAxeViolations(container);
      });
    }
  }
});
