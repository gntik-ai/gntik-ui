import { Button, Input, newQueryId, useI18n, type QueryGroup } from '@gntik-ai/ui';
import { useState } from 'react';
import { DataTable, type DataTableQuery } from '../DataTable';
import type { DataTableColumn } from '../data-table-utils';

const rows = Array.from({ length: 24 }, (_, index) => ({
  id: String(index + 1),
  name: `Item ${index + 1}`,
  status: index % 3 === 0 ? 'failed' : 'paused',
  cost: index * 25,
  created: new Date(2026, 9, index + 1),
  enabled: index % 2 === 0,
}));
const empty: QueryGroup = { type: 'group', id: 'example', combinator: 'and', children: [] };
const failed: QueryGroup = {
  ...empty,
  children: [{ type: 'condition', id: 'failed', field: 'status', operator: 'in', value: ['failed'] }],
};

/** Draft filters, controlled models, saved views, and server requests without client filtering. */
export default function HeaderFiltersExample() {
  const { t } = useI18n();
  const [model, setModel] = useState(empty);
  const [query, setQuery] = useState<DataTableQuery | null>(null);
  const columns: DataTableColumn<(typeof rows)[number]>[] = [
    {
      id: 'name',
      header: t('table.filterExample.name'),
      accessor: (row) => row.name,
      sortable: true,
      filter: { type: 'text' },
    },
    {
      id: 'status',
      header: t('table.filterExample.status'),
      accessor: (row) => row.status,
      sortable: true,
      filter: {
        type: 'enum',
        searchable: true,
        options: [
          { value: 'failed', label: t('table.filterExample.failed') },
          { value: 'paused', label: t('table.filterExample.paused') },
        ],
      },
      cell: (row) => t(row.status === 'failed' ? 'table.filterExample.failed' : 'table.filterExample.paused'),
    },
    { id: 'cost', header: t('table.filterExample.cost'), accessor: (row) => row.cost, filter: { type: 'number' } },
    {
      id: 'created',
      header: t('table.filterExample.created'),
      accessor: (row) => row.created,
      filter: { type: 'date' },
    },
    {
      id: 'enabled',
      header: t('table.filterExample.enabled'),
      accessor: (row) => row.enabled,
      filter: { type: 'boolean' },
    },
    {
      id: 'custom',
      header: t('table.filterExample.custom'),
      accessor: (row) => row.name,
      filter: {
        type: 'custom',
        render: ({ value, setValue }) => (
          <Input
            aria-label={t('table.filterExample.custom')}
            value={typeof value?.value === 'string' ? value.value : ''}
            onChange={(event) =>
              setValue(event.target.value ? { operator: 'startsWith', value: event.target.value } : null)
            }
          />
        ),
      },
    },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('table.filterExample.description')}</p>
      <Button variant="secondary" onClick={() => setModel({ ...empty, id: newQueryId() })}>
        {t('table.filterExample.reset')}
      </Button>
      <DataTable
        rows={rows}
        columns={columns}
        caption={t('table.filterExample.client')}
        showCaption
        filterModel={model}
        defaultFilterModel={empty}
        onFilterModelChange={setModel}
        selectAllMatching
        csvExport
        defaultViews={[
          { id: 'failed', name: t('table.filterExample.saved'), state: { filterModel: failed } },
          { id: 'legacy', name: t('table.filterExample.legacy'), state: {} },
        ]}
      />
      <DataTable
        rows={rows.slice(0, 10)}
        columns={columns}
        caption={t('table.filterExample.server')}
        showCaption
        paginationMode="server"
        rowCount={rows.length}
        page={3}
        pageSize={10}
        onFilterModelChange={() => {}}
        onQueryChange={setQuery}
      />
      <pre
        aria-label={t('table.filterExample.request')}
        className="overflow-auto rounded-lg border border-border bg-secondary p-3 text-xs text-foreground"
      >
        {JSON.stringify(query?.filterModel ?? empty, null, 2)}
      </pre>
    </div>
  );
}
