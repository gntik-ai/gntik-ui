// Fixed browser fixture shared by the immutable baseline and current source.
import './styles.css';
import { createRoot } from 'react-dom/client';
import { I18nProvider, ThemeProvider } from '@gntik-ai/ui';
import { DataTable, FilterBar, PaginationFooter } from '@gntik-ai/blocks';
import {
  paginationLabels,
  filterLabels,
  tableLabels,
} from '../../../packages/blocks/src/tables/__tests__/labels-fixtures';

const params = new URLSearchParams(location.search);
const mode = params.get('mode') ?? 'default';
const theme = params.get('theme') ?? 'dark';
const locale = params.get('locale') ?? 'en';
const block = params.get('block') ?? 'table';
const state = params.get('state');
const labels = mode === 'default' ? undefined : mode === 'es' ? 'es' : 'en';
const rows = [
  { id: 'a', name: 'A', group: 'G' },
  { id: 'b', name: 'B', group: 'G' },
  { id: 'c', name: 'C', group: '' },
];
const columns = [
  { id: 'name', header: 'Name', accessor: (row) => row.name, editable: true, sortable: true },
  { id: 'group', header: 'Category', accessor: (row) => row.group },
];
let fixture;
if (block === 'pagination')
  fixture = <PaginationFooter total={97} noun="A" labels={labels && paginationLabels[labels]} />;
else if (block === 'filters')
  fixture = (
    <FilterBar
      fields={[{ id: 'kind', label: 'Kind', options: ['A', 'B'] }]}
      defaultFilters={[]}
      views={[{ value: 'a', label: 'Choice A', filters: [{ field: 'kind', value: 'A' }] }]}
      resultCount={state === 'count-N' ? 1234 : 1}
      labels={labels && filterLabels[labels]}
    />
  );
else
  fixture = (
    <DataTable
      rows={state === 'empty' ? [] : rows}
      columns={columns}
      caption="A"
      labels={labels && tableLabels[labels]}
      groupBy="group"
      resizable
      showPinMenu
      defaultViews={[{ id: 'choice', name: 'Choice A', state: {} }]}
      onCellEdit={() => false}
      loading={state === 'loading'}
    />
  );

createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultMode={theme} storageKey={null}>
    <I18nProvider locale={locale}>
      <div className="p-6">{fixture}</div>
    </I18nProvider>
  </ThemeProvider>,
);
