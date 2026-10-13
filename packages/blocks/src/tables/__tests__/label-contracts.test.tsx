import { I18nProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import { DataTable } from '../DataTable/DataTable';
import { FilterBar } from '../FilterBar/FilterBar';
import { PaginationFooter } from '../PaginationFooter/PaginationFooter';
import { meta as tableMeta } from '../DataTable/block.meta';
import { meta as filterMeta } from '../FilterBar/block.meta';
import { meta as paginationMeta } from '../PaginationFooter/block.meta';
import { tableLabels, filterLabels, paginationLabels } from './labels-fixtures';

function entries(object: object, prefix = ''): Array<[string, string]> {
  return Object.entries(object).flatMap(([key, value]: [string, unknown]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === 'object' ? entries(value, path) : [[path, typeof value]];
  });
}

it.each([
  ['PaginationFooter', paginationMeta, paginationLabels.en],
  ['FilterBar', filterMeta, filterLabels.en],
  ['DataTable', tableMeta, tableLabels.en],
] as const)('%s documents every key, type and interaction state for kit consumers', (_name, meta, labels) => {
  for (const [key, type] of entries(labels)) {
    expect(meta.description).toContain(`${key}: ${type === 'function' ? '(' : 'string'}`);
    // Each inventory entry must name its state, including entries forwarded to pagination.
    expect(meta.description).toMatch(new RegExp(`${key.replaceAll('.', '\\.')}:[^;]+ — [^;]+`));
  }
});

it('deep partial overrides beat provider messages; siblings keep current provider / hardcoded defaults', () => {
  render(
    <I18nProvider
      locale="es"
      messages={{
        'table.columns': 'Provider columns',
        'table.compact': 'Provider compact',
        'table.rowsPerPage': 'Provider page size',
        'filters.add': 'Provider filter',
      }}
    >
      <DataTable
        labels={{
          columnMenu: { trigger: 'Caller columns' },
          density: { comfortable: 'Caller density' },
          pagination: { next: 'Caller next' },
        }}
      />
      <FilterBar labels={{ search: 'Caller search' }} searchLabel="Legacy search" placeholder="Legacy placeholder" />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Caller columns' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Caller density' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Provider compact' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Provider page size' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Caller next' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Página anterior' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Provider filter' })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: 'Caller search' })).toHaveAttribute('placeholder', 'Legacy placeholder');
  expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument();
});

it('empty partial labels preserve the default DOM including styled summary spans', () => {
  const { container, rerender } = render(<PaginationFooter />);
  const original = container.innerHTML;
  rerender(<PaginationFooter labels={{}} />);
  expect(container.innerHTML).toBe(original);
});
