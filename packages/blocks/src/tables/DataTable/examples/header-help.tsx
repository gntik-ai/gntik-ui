import { Gauge } from '@gntik-ai/icons';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../data-table-utils';

const rows = [
  { id: 'requests', name: 'Requests', p95: 240, tokens: 18400, cost: 0.92 },
  { id: 'batch', name: 'Batch processing', p95: 860, tokens: 32500, cost: 1.63 },
];

const columns: DataTableColumn<(typeof rows)[number]>[] = [
  { id: 'name', header: 'Workload', accessor: (row) => row.name },
  {
    id: 'p95',
    header: 'p95 latency',
    accessor: (row) => row.p95,
    sortable: true,
    description: '95th percentile of request latency in the period.',
    renderHeader: () => (
      <>
        <Gauge size={14} aria-hidden className="inline-block" /> p95 latency <span>(ms)</span>
      </>
    ),
    variant: 'numeric',
    width: 220,
  },
  {
    id: 'tokens',
    header: 'Tokens',
    accessor: (row) => row.tokens,
    sortable: true,
    description: 'Total input and output tokens processed in the period.',
    variant: 'numeric',
  },
  {
    id: 'cost',
    header: 'Cost',
    accessor: (row) => row.cost,
    sortable: true,
    description: 'Usage cost in US dollars before taxes in the period.',
    renderHeader: () => (
      <>
        Cost <span>(USD)</span>
      </>
    ),
    variant: 'numeric',
  },
];

/** Only describe columns that need a definition: each InfoTip adds a keyboard stop. */
export default function HeaderHelpDataTable() {
  return <DataTable caption="Usage" rows={rows} columns={columns} selectionMode="none" resizable paginated={false} />;
}
