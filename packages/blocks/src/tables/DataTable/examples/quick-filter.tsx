import { matchText, useI18n } from '@gntik-ai/ui';
import { useMemo, useState } from 'react';
import { FilterBar } from '../../FilterBar/FilterBar';
import { PageToolbar } from '../../../page-chrome/PageToolbar/PageToolbar';
import { DataTable, type DataTableQuery } from '../DataTable';
import type { DataTableColumn } from '../data-table-utils';

interface Row {
  id: string;
  name: string;
  region: string;
  owner: { name: string; email: string };
  tier: string;
  requests: number;
}

const owners = [
  { name: 'Ana Ruiz', email: 'ana@example.test' },
  { name: 'Lee Chen', email: 'lee@example.test' },
  { name: 'Sam Patel', email: 'sam@example.test' },
];
const services = ['orders-api', 'billing-sync', 'Función', 'search-index', 'media-resize', 'auth-gateway'];
const regions = ['eu-west-1', 'us-east-1', 'ap-south-1'];
const rows: Row[] = Array.from({ length: 18 }, (_, i) => ({
  id: `d${i + 1}`,
  name: services[i % services.length]!,
  region: regions[i % regions.length]!,
  owner: owners[i % owners.length]!,
  tier: i % 2 === 0 ? 'gold' : 'silver',
  requests: 1200 + i * 37,
}));

/**
 * The DataTable quick filter: a built-in search over the searchable columns (the owner matches by name and email
 * through a matcher, the hidden tier opts in, requests opts out), a collapsible variant, and a server table that only
 * reports the term. The page inputs below show `queryDebounceMs` and `searchDebounceMs` calling back once typing stops.
 */
export default function QuickFilterExample() {
  const { t } = useI18n();
  const columns = useMemo<Array<DataTableColumn<Row>>>(
    () => [
      { id: 'name', header: t('table.example.quickFilter.name'), accessor: (row) => row.name },
      { id: 'region', header: t('table.example.quickFilter.region'), accessor: (row) => row.region },
      {
        id: 'owner',
        header: t('table.example.quickFilter.owner'),
        accessor: (row) => row.owner.name,
        quickFilter: (row, term) => [row.owner.name, row.owner.email].some((value) => matchText(value, term)),
      },
      {
        id: 'tier',
        header: t('table.example.quickFilter.tier'),
        accessor: (row) => row.tier,
        defaultHidden: true,
        quickFilter: true,
      },
      {
        id: 'requests',
        header: t('table.example.quickFilter.requests'),
        accessor: (row) => row.requests,
        variant: 'numeric',
        quickFilter: false,
      },
    ],
    [t],
  );
  const [serverTerm, setServerTerm] = useState<string | null>(null);
  const [page, setPage] = useState(4);
  const [toolbarCalls, setToolbarCalls] = useState(0);
  const [filterBarCalls, setFilterBarCalls] = useState(0);
  const noMatches = (
    <p className="p-6 text-center text-[13px] text-muted-foreground">{t('table.example.quickFilter.noMatches')}</p>
  );

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h3 className="text-[14px] font-semibold text-foreground">{t('table.example.quickFilter.clientTitle')}</h3>
        <DataTable
          caption={t('table.example.quickFilter.caption')}
          columns={columns}
          rows={rows}
          defaultPageSize={5}
          pageSizeOptions={[5, 10]}
          showQuickFilter
          noResultsState={noMatches}
        />
      </section>
      <section className="space-y-2">
        <h3 className="text-[14px] font-semibold text-foreground">{t('table.example.quickFilter.collapsibleTitle')}</h3>
        <DataTable
          caption={t('table.example.quickFilter.collapsibleCaption')}
          columns={columns}
          rows={rows}
          selectionMode="none"
          defaultPageSize={5}
          pageSizeOptions={[5, 10]}
          showQuickFilter="collapsible"
          quickFilterDebounceMs={150}
          noResultsState={noMatches}
        />
      </section>
      <section className="space-y-2">
        <h3 className="text-[14px] font-semibold text-foreground">{t('table.example.quickFilter.serverTitle')}</h3>
        <DataTable
          caption={t('table.example.quickFilter.serverCaption')}
          columns={columns}
          rows={rows.slice(0, 5)}
          selectionMode="none"
          paginationMode="server"
          rowCount={95}
          page={page}
          pageSize={5}
          pageSizeOptions={[5]}
          onPageChange={setPage}
          showQuickFilter
          onQueryChange={(query: DataTableQuery) => {
            if (query.cause === 'quickFilter') setServerTerm(query.quickFilter ?? '');
          }}
        />
        <p className="text-[12.5px] text-muted-foreground" aria-live="polite">
          {t('table.example.quickFilter.lastRequest', { term: serverTerm ?? t('table.example.quickFilter.noRequest') })}
        </p>
        <PageToolbar
          searchDebounceMs={250}
          onSearchChange={() => setToolbarCalls((n) => n + 1)}
          searchPlaceholder={t('table.example.quickFilter.searchPlaceholder')}
          filters={null}
          views={null}
          primaryAction={null}
        />
        <p className="text-[12.5px] text-muted-foreground">
          {t('table.example.quickFilter.toolbarCalls', { count: toolbarCalls })}
        </p>
        <FilterBar
          queryDebounceMs={250}
          onQueryChange={() => setFilterBarCalls((n) => n + 1)}
          placeholder={t('table.example.quickFilter.searchPlaceholder')}
          fields={[]}
          views={[]}
          defaultFilters={[]}
        />
        <p className="text-[12.5px] text-muted-foreground">
          {t('table.example.quickFilter.filterBarCalls', { count: filterBarCalls })}
        </p>
      </section>
    </div>
  );
}
