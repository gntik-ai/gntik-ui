import './styles.css';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as current from '@gntik-ai/blocks';
import * as published from '@gntik-ai/blocks-baseline';
import { Button, Stack, ThemeProvider, I18nProvider } from '@gntik-ai/ui';
import { ThemeProvider as PublishedTheme, I18nProvider as PublishedI18n } from '@gntik-ai/ui-baseline';
import { fixtureLabels } from './block-labels-copy.js';
import { installFixtureLandmarks } from './block-labels-landmarks.js';

installFixtureLandmarks(document);

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

const paginationColumns = [
  { id: 'id', header: 'Id', accessor: (row) => row.id, sortable: true },
  { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
  { id: 'region', header: 'Region', accessor: (row) => row.region, sortable: true },
];
const clientRows = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  region: i % 2 ? 'East' : 'West',
}));

function ServerPaginationFixture() {
  const [page, setPage] = useState(Number(params.get('page') || 2));
  const pageSize = Number(params.get('pageSize') || 20);
  const rowCount = Number(params.get('rowCount') || (variant === 'empty' ? 0 : 95));
  const end = Math.min(page * pageSize, rowCount);
  const suppliedRows =
    variant === 'empty'
      ? []
      : Array.from({ length: Math.max(0, end - (page - 1) * pageSize) }, (_, i) => ({
          id: end - i,
          name: `Item ${end - i}`,
          region: i % 2 ? 'East' : 'West',
        }));
  return (
    <Stack>
      <current.DataTable
        caption="Items"
        selectionMode="none"
        rows={suppliedRows}
        columns={paginationColumns}
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={record('page')}
        onPageSizeChange={record('pageSize')}
        onSortChange={record('sort')}
      />
      {[1, 3, 5].map((next) => (
        <Button key={next} onClick={() => setPage(next)}>
          Consumer page {next}
        </Button>
      ))}
    </Stack>
  );
}

function Fixture() {
  const [count, setCount] = useState(12);
  const { PaginationFooter, FilterBar, DataTable } = kit;
  if (block === 'table-server-pagination') return <ServerPaginationFixture />;
  if (block === 'table-client-pagination')
    return (
      <DataTable
        caption="Items"
        selectable={false}
        rows={clientRows}
        columns={paginationColumns}
        defaultPageSize={10}
      />
    );
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
