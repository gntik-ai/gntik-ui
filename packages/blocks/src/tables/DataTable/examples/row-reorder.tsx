import { useState } from 'react';
import { useI18n } from '@gntik-ai/ui';
import { DataTable } from '../DataTable';
import { reorderRows, type DataTableColumn } from '../data-table-utils';

const rules = [
  { id: 'health-check', path: '/health', locked: false },
  { id: 'billing-api', path: '/billing/*', locked: false },
  { id: 'orders-api', path: '/orders/*', locked: false },
  { id: 'default-route', path: '/*', locked: true },
];

/** The caller owns priority. Sorting and filtering disable the handles until cleared. */
export default function RowReorderExample() {
  const { t } = useI18n();
  const [rows, setRows] = useState(rules);
  const columns: DataTableColumn<(typeof rules)[number]>[] = [
    {
      id: 'id',
      header: t('table.example.routeRule'),
      accessor: (row) => row.id,
      sortable: true,
      width: 220,
      filter: { type: 'text' },
    },
    { id: 'path', header: t('table.example.routePath'), accessor: (row) => row.path, width: 200 },
  ];
  return (
    <DataTable
      rows={rows}
      columns={columns}
      caption={t('table.example.routingPriority')}
      showCaption
      getRowLabel={(row) => row.id}
      onRowReorder={(move) => setRows((current) => reorderRows(current, move))}
      isRowReorderable={(row) => !row.locked}
      showQuickFilter
      resizable
      defaultPinnedColumns={{ left: ['id'] }}
      defaultPageSize={10}
    />
  );
}
