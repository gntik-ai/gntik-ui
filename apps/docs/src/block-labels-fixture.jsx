import './styles.css';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as current from '@gntik-ai/blocks';
import * as published from '@gntik-ai/blocks-baseline';
import { ThemeProvider, I18nProvider } from '@gntik-ai/ui';
import { ThemeProvider as PublishedTheme, I18nProvider as PublishedI18n } from '@gntik-ai/ui-baseline';
import { fixtureLabels } from './block-labels-copy.js';

const params = new URLSearchParams(location.search);
const baseline = params.get('mode') === 'baseline';
const language = params.get('mode') === 'es' ? 'es' : 'en';
const theme = params.get('theme') || 'dark';
const block = params.get('block') || 'pagination';
const variant = params.get('variant') || 'normal';
const kit = baseline ? published : current;
const Theme = baseline ? PublishedTheme : ThemeProvider;
const I18n = baseline ? PublishedI18n : I18nProvider;
window.labelCalls = [];
window.callbackCalls = [];
const record =
  (name) =>
  (...args) =>
    window.callbackCalls.push([name, args]);
const labels = ['en', 'es'].includes(params.get('mode'))
  ? fixtureLabels(language, (key, args) => window.labelCalls.push([key, args]))
  : undefined;
const rows = [
  { id: 'a', name: 'Alpha', region: 'West', quantity: 2 },
  { id: 'b', name: 'Beta', region: 'East', quantity: 3 },
];
const columns = [
  { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, width: 200, editable: true },
  { id: 'region', header: 'Region', accessor: (row) => row.region, sortable: true, width: 160 },
  {
    id: 'quantity',
    header: 'Quantity',
    accessor: (row) => row.quantity,
    width: 120,
    editable: true,
    editor: { type: 'number', min: 1, max: 10 },
  },
];

function Fixture() {
  const [count, setCount] = useState(12);
  const { PaginationFooter, FilterBar, DataTable } = kit;
  if (block === 'pagination')
    return (
      <PaginationFooter
        labels={labels}
        noun="Items"
        total={97}
        onPageChange={record('page')}
        onPageSizeChange={record('pageSize')}
      />
    );
  if (block === 'filter')
    return (
      <FilterBar
        labels={labels}
        resultCount={count}
        fields={[{ id: 'status', label: 'Status', options: ['Ready', 'Failed'] }]}
        defaultFilters={[]}
        views={[{ value: 'saved', label: 'Saved', filters: [{ field: 'status', value: 'Ready' }] }]}
        onQueryChange={record('query')}
        onViewChange={record('filterView')}
        onFiltersChange={(next) => {
          record('filters')(next);
          setCount(12 - next.length);
        }}
      />
    );
  return (
    <DataTable
      labels={labels}
      rows={variant === 'empty' ? [] : rows}
      columns={columns}
      caption="Items"
      loading={variant === 'loading'}
      groupBy={variant === 'grouped' ? () => '' : undefined}
      defaultViews={[{ id: 'saved', name: 'Saved', state: {} }]}
      resizable
      showPinMenu
      rowActions={() => [{ label: 'Inspect', onClick: record('inspect') }]}
      onCellEdit={variant === 'editing' ? () => false : undefined}
      onSelectionChange={record('selection')}
      onHiddenColumnsChange={record('hidden')}
      onPinnedColumnsChange={record('pinned')}
      onDensityChange={record('density')}
      onColumnWidthsChange={record('widths')}
      onViewsChange={record('views')}
      onActiveViewChange={record('activeView')}
    />
  );
}

createRoot(document.getElementById('root')).render(
  <Theme defaultMode={theme} storageKey={null}>
    <I18n locale="en" applyTo="document">
      <Fixture />
    </I18n>
  </Theme>,
);
