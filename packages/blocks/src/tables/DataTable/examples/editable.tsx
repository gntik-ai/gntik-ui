import { StatusTag } from '@gntik-ai/ui';
import { useState } from 'react';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../data-table-utils';
import { DEPLOYMENT_ROWS, type DeploymentRow } from '../fixtures';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const STATUS_OPTIONS = ['running', 'queued', 'paused', 'degraded', 'failed'].map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1) }));

const COLUMNS: Array<DataTableColumn<DeploymentRow>> = [
  { id: 'name', header: 'Deployment', accessor: (r) => r.name, sortable: true, hideable: false, className: 'font-semibold', editable: true },
  { id: 'region', header: 'Region', accessor: (r) => r.region, variant: 'mono' },
  {
    id: 'status',
    header: 'Status',
    accessor: (r) => r.status,
    cell: (r) => <StatusTag status={r.status} />,
    editable: true,
    editor: { type: 'select', options: STATUS_OPTIONS },
  },
  {
    id: 'cost',
    header: 'Budget',
    accessor: (r) => r.cost,
    cell: (r) => money.format(r.cost),
    variant: 'numeric',
    editable: true,
    editor: { type: 'number', min: 0, step: 0.01 },
  },
];

/**
 * Inline editing: Enter or F2 edits a cell, Enter or Tab saves, Escape cancels. Names must be
 * unique and budgets above $1,000 are rejected by the (simulated) server, with the error inline.
 */
export default function EditableDataTable() {
  const [rows, setRows] = useState(() => DEPLOYMENT_ROWS.slice(0, 8));
  return (
    <DataTable<DeploymentRow>
      caption="Deployment settings"
      rows={rows}
      columns={COLUMNS}
      paginated={false}
      selectable={false}
      onCellEdit={async ({ rowId, columnId, value }) => {
        if (columnId === 'name') {
          const name = String(value ?? '').trim();
          if (!name) return 'Enter a name.';
          if (rows.some((r) => r.id !== rowId && r.name === name)) return `“${name}” is already taken.`;
        }
        if (columnId === 'cost') {
          await new Promise((resolve) => setTimeout(resolve, 150));
          if (typeof value !== 'number') return 'Enter a budget.';
          if (value > 1000) return 'Budgets above $1,000 need approval.';
        }
        setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, [columnId]: value } : r)));
      }}
    />
  );
}
