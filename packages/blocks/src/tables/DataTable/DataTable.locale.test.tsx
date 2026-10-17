import { I18nProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable } from './DataTable';
import type { CellValue, DataTableColumn } from './data-table-utils';

type Row = { id: string; value: CellValue };
const columns: DataTableColumn<Row>[] = [
  { id: 'value', header: 'Value', accessor: (row) => row.value, sortable: true },
];
const rowsOf = (...values: CellValue[]): Row[] => values.map((value, i) => ({ id: String(i), value }));
const cellTexts = () => screen.getAllByRole('cell').map((cell) => cell.textContent);

describe('DataTable default cell locale', () => {
  it('reads boolean labels from the Spanish catalog', () => {
    render(
      <I18nProvider locale="es">
        <DataTable rows={rowsOf(true, false)} columns={columns} selectable={false} paginated={false} />
      </I18nProvider>,
    );
    expect(cellTexts()).toEqual(['Sí', 'No']);
  });

  it.each(['es', 'en'])('prefers per-instance boolean labels under %s', (locale) => {
    render(
      <I18nProvider locale={locale}>
        <DataTable
          rows={rowsOf(true, false)}
          columns={columns}
          selectable={false}
          paginated={false}
          labels={{ booleanTrue: 'On', booleanFalse: 'Off' }}
        />
      </I18nProvider>,
    );
    expect(cellTexts()).toEqual(['On', 'Off']);
  });

  it.each([
    ['es', '17/10/2026'],
    ['en-US', '10/17/2026'],
  ])('formats valid dates and handles invalid dates under %s', (locale, expected) => {
    render(
      <I18nProvider locale={locale}>
        <DataTable
          rows={rowsOf(new Date(2026, 9, 17), new Date('x'))}
          columns={columns}
          selectable={false}
          paginated={false}
        />
      </I18nProvider>,
    );
    expect(cellTexts()).toEqual([expected, '—']);
  });

  it.each([
    ['es', ['1234,5', '1234567', '0,30000000000000004', 'NaN', 'Infinity', '-Infinity']],
    ['en', ['1234.5', '1234567', '0.30000000000000004', 'NaN', 'Infinity', '-Infinity']],
  ] as const)('keeps number digits and only localizes the decimal separator under %s', (locale, expected) => {
    render(
      <I18nProvider locale={locale}>
        <DataTable
          rows={rowsOf(1234.5, 1234567, 0.30000000000000004, NaN, Infinity, -Infinity)}
          columns={columns}
          selectable={false}
          paginated={false}
        />
      </I18nProvider>,
    );
    expect(cellTexts()).toEqual(expected);
  });

  it('keeps English boolean labels under an English provider', () => {
    render(
      <I18nProvider locale="en">
        <DataTable rows={rowsOf(true, false)} columns={columns} selectable={false} paginated={false} />
      </I18nProvider>,
    );
    expect(cellTexts()).toEqual(['Yes', 'No']);
  });

  it('uses provider catalog overrides with individual label fallbacks', () => {
    render(
      <I18nProvider locale="es" messages={{ 'common.yes': 'Affirmative', 'common.no': 'Negative' }}>
        <DataTable
          rows={rowsOf(true, false)}
          columns={columns}
          selectable={false}
          paginated={false}
          labels={{ booleanTrue: 'On' }}
        />
      </I18nProvider>,
    );
    expect(cellTexts()).toEqual(['On', 'Negative']);
  });

  it('keeps runtime defaults outside a provider', () => {
    const date = new Date(2026, 9, 17);
    render(
      <DataTable
        rows={rowsOf(true, false, date, 1234.5, 1234567, 0.30000000000000004)}
        columns={columns}
        selectable={false}
        paginated={false}
      />,
    );
    expect(cellTexts()).toEqual(['Yes', 'No', date.toLocaleDateString(), '1234.5', '1234567', '0.30000000000000004']);
  });

  it('sorts raw numeric accessor values while showing Spanish decimals', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="es">
        <DataTable rows={rowsOf(10.1, 2.2, 2.11)} columns={columns} selectable={false} paginated={false} />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Value' }));
    expect(cellTexts()).toEqual(['2,11', '2,2', '10,1']);
    await user.click(screen.getByRole('button', { name: 'Value' }));
    expect(cellTexts()).toEqual(['10,1', '2,2', '2,11']);
  });

  it('leaves custom cell renderers in control', () => {
    render(
      <I18nProvider locale="es">
        <DataTable
          rows={rowsOf(true, new Date('x'), 1234.5)}
          columns={[{ ...columns[0]!, cell: () => 'Custom value' }]}
          selectable={false}
          paginated={false}
        />
      </I18nProvider>,
    );
    expect(cellTexts()).toEqual(['Custom value', 'Custom value', 'Custom value']);
  });

  it.each(['dark', 'light', 'high_contrast'])('has no structural axe violations in %s', async (theme) => {
    document.documentElement.className = theme;
    const { container } = render(
      <I18nProvider locale="es">
        <DataTable
          rows={rowsOf(true, false, new Date(2026, 9, 17), new Date('x'), 1234.5)}
          columns={columns}
          caption="Values"
          selectable={false}
          paginated={false}
        />
      </I18nProvider>,
    );
    await expectNoAxeViolations(container);
  });
});
