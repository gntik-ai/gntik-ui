import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as current from '@gntik-ai/blocks';
import * as baseline from '@gntik-ai/blocks-baseline';
import { labelFixture } from './block-labels';
import '../../src/styles.css';

const query = new URLSearchParams(location.search);
const theme = query.get('theme') ?? 'dark';
document.documentElement.className = theme;
const locale = query.get('locale') ?? 'defaults';
document.documentElement.lang = locale === 'es' ? 'es' : 'en';
const kit = query.get('version') === 'baseline' ? baseline : current;
const { PaginationFooter, FilterBar, DataTable } = kit;
window.labelCalls = [];
window.callbackCalls = [];
const labels = locale === 'defaults' ? undefined : labelFixture(locale, (call) => window.labelCalls.push(call));
const callback =
  (key) =>
  (...args) => {
    window.callbackCalls.push({ key, args });
  };
const rows = [
  { id: 'a', name: 'Alpha', region: 'East', enabled: true },
  { id: 'b', name: 'Beta', region: 'East', enabled: false },
  { id: 'c', name: 'Gamma', region: '', enabled: true },
];
const columns = [
  { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, editable: true },
  { id: 'region', header: 'Region', accessor: (row) => row.region },
  { id: 'enabled', header: 'Enabled', accessor: (row) => row.enabled },
];
function Fixture() {
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  if (query.get('block') === 'pagination')
    return (
      <PaginationFooter
        total={97}
        labels={labels?.pagination}
        onPageChange={callback('page')}
        onPageSizeChange={callback('pageSize')}
      />
    );
  if (query.get('block') === 'filters')
    return (
      <FilterBar
        fields={[{ id: 'state', label: 'State', options: ['Ready', 'Busy'] }]}
        defaultFilters={[]}
        views={[{ value: 'first', label: 'First', filters: [{ field: 'state', value: 'Ready' }] }]}
        labels={labels?.filters}
        resultCount={1234}
        onQueryChange={callback('query')}
        onFiltersChange={callback('filters')}
        onViewChange={callback('view')}
      />
    );
  return (
    <>
      <DataTable
        rows={empty ? [] : rows}
        columns={columns}
        caption="Caller records"
        groupBy="region"
        resizable
        showPinMenu
        defaultViews={[{ id: 'first', name: 'First', state: {} }]}
        labels={labels?.table}
        loading={loading}
        onSelectionChange={callback('selected')}
        onDensityChange={callback('density')}
        onHiddenColumnsChange={callback('columns')}
        onPinnedColumnsChange={callback('pin')}
        onColumnWidthsChange={callback('width')}
        onSortChange={callback('sort')}
        onViewsChange={callback('views')}
        onActiveViewChange={callback('activeView')}
        onCellEdit={callback('edit')}
        rowActions={() => [{ label: 'Inspect', onClick: callback('inspect') }]}
      />
      <div id="fixture-controls">
        <button onClick={() => setLoading((value) => !value)}>Toggle loading</button>
        <button onClick={() => setEmpty((value) => !value)}>Toggle empty</button>
      </div>
    </>
  );
}
createRoot(document.getElementById('root')).render(<Fixture />);
