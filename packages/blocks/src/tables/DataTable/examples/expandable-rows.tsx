import { useState } from 'react';
import { JsonViewer, useI18n } from '@gntik-ai/ui';
import { ErrorPanel } from '../../../feedback/ErrorPanel/ErrorPanel';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../data-table-utils';

const rows = [
  { id: 'inv-42', status: 'failed', payload: { task: 'index', attempt: 2 }, error: 'Request timed out' },
  { id: 'inv-43', status: 'succeeded', payload: { task: 'summarize', attempt: 1 }, error: null },
  { id: 'inv-44', status: 'failed', payload: { task: 'export', attempt: 1 }, error: 'Service unavailable' },
];
const controlledRows = rows.map((row) => ({ ...row, id: row.id.replace('inv-4', 'inv-5') }));
type Invocation = (typeof rows)[number];

/** Inline panels retain list context; use a Drawer for a longer, independent workflow. */
export default function ExpandableRows() {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<string[]>(['inv-52']);
  const columns: DataTableColumn<Invocation>[] = [
    { id: 'id', header: t('table.example.invocation'), accessor: (row) => row.id, sortable: true },
    { id: 'status', header: t('table.example.invocationStatus'), accessor: (row) => row.status },
  ];
  const renderDetail = (row: Invocation) => (
    <div className="grid gap-4">
      <JsonViewer data={row.payload} label={t('table.example.payload')} />
      {row.error && (
        <ErrorPanel
          title={t('table.example.invocationError', { label: row.id })}
          message={row.error}
          announce={false}
        />
      )}
    </div>
  );
  return (
    <div className="grid gap-6">
      <DataTable
        rows={rows}
        columns={columns}
        getRowLabel={(row) => row.id}
        caption={t('table.example.inlineDetails')}
        showCaption
        renderDetail={renderDetail}
        hasDetail={(row) => row.status === 'failed'}
        defaultExpandedDetailIds={['inv-42']}
        detailExpandMode="single"
        detailOnRowClick
        defaultPageSize={10}
        resizable
        defaultPinnedColumns={{ left: ['id'], right: ['status'] }}
      />
      <DataTable
        rows={controlledRows}
        columns={columns}
        getRowLabel={(row) => row.id}
        caption={t('table.example.controlledDetails')}
        showCaption
        renderDetail={renderDetail}
        expandedDetailIds={expanded}
        onExpandedDetailIdsChange={setExpanded}
        detailExpandMode="multiple"
        paginated={false}
      />
    </div>
  );
}
