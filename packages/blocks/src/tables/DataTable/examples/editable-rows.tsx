import { useState } from 'react';
import { Button, Input, useI18n } from '@gntik-ai/ui';
import { DataTable } from '../DataTable';
import type {
  DataTableColumn,
  DataTableEditValue,
  DataTableRowEdit,
  DataTableRowsSaveResult,
} from '../data-table-utils';

interface Row {
  id: string;
  name: string;
  quota: number;
  notes: string;
  enabled: string;
  date: string;
  region: string;
  custom: string;
}
const initial: Row[] = [
  {
    id: 'a',
    name: 'api-gateway',
    quota: 100,
    notes: 'HTTP routing',
    enabled: 'true',
    date: '2026-10-17',
    region: 'standard',
    custom: 'gateway',
  },
  {
    id: 'b',
    name: 'billing',
    quota: 200,
    notes: 'Usage reports',
    enabled: 'false',
    date: '2026-10-18',
    region: 'priority',
    custom: 'billing',
  },
];
function apply(row: Row, values: Record<string, DataTableEditValue>): Row {
  return {
    ...row,
    name: String(values.name ?? ''),
    quota: Number(values.quota),
    notes: String(values.notes ?? ''),
    enabled: String(values.enabled ?? 'false'),
    date: String(values.date ?? ''),
    region: String(values.region ?? 'standard'),
    custom: String(values.custom ?? ''),
  };
}
export default function EditableRows() {
  const { t } = useI18n();
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<string[]>([]);
  const [virtualRows, setVirtualRows] = useState(() =>
    Array.from({ length: 100 }, (_, index) => ({ ...initial[0]!, id: `v${index}`, name: `item-${index}` })),
  );
  const columns: DataTableColumn<Row>[] = [
    {
      id: 'name',
      header: t('table.example.name'),
      accessor: (row) => row.name,
      editable: true,
      sortable: true,
      validate: (value) => (String(value ?? '').trim() ? undefined : t('table.example.required')),
    },
    {
      id: 'quota',
      header: t('table.example.quota'),
      accessor: (row) => row.quota,
      editable: true,
      editor: { type: 'number', min: 0 },
      variant: 'numeric',
    },
    {
      id: 'notes',
      header: t('table.example.notes'),
      accessor: (row) => row.notes,
      editable: true,
      editor: { type: 'textarea', rows: 2 },
    },
    {
      id: 'enabled',
      header: t('table.example.enabled'),
      accessor: (row) => row.enabled,
      editable: true,
      editor: { type: 'switch' },
    },
    {
      id: 'date',
      header: t('table.example.date'),
      accessor: (row) => row.date,
      editable: true,
      editor: { type: 'date' },
    },
    {
      id: 'region',
      header: t('table.example.region'),
      accessor: (row) => row.region,
      editable: true,
      editor: {
        type: 'combobox',
        options: [
          { value: 'standard', label: t('table.example.standard') },
          { value: 'priority', label: t('table.example.priority') },
        ],
      },
    },
    {
      id: 'custom',
      header: t('table.example.custom'),
      accessor: (row) => row.custom,
      editable: true,
      renderEditor: ({ inputProps, value, setValue, commit }) => (
        <div className="flex gap-1">
          <Input {...inputProps} value={String(value ?? '')} onChange={(event) => setValue(event.target.value)} />
          <Button size="sm" variant="ghost" onClick={commit}>
            {t('table.example.apply')}
          </Button>
        </div>
      ),
    },
  ];
  const persist = (edits: DataTableRowEdit<Row>[]) =>
    setRows((current) =>
      current.map((row) => {
        const edit = edits.find((item) => item.rowId === row.id);
        return edit ? apply(row, edit.values) : row;
      }),
    );
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t('table.example.rowExampleTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('table.example.rowExampleHelp')}</p>
        <DataTable
          rows={rows}
          columns={columns}
          caption={t('table.example.rowExampleTitle')}
          selectionMode="none"
          editMode="row"
          editingRowIds={editing}
          onEditingRowIdsChange={setEditing}
          defaultPageSize={1}
          pageSizeOptions={[1, 2]}
          onRowSave={(edit) => {
            if (Number(edit.values.quota) > 500) return { fieldErrors: { quota: t('table.example.quotaError') } };
            persist([edit]);
          }}
          onRowsSave={(edits) => {
            const errors: Exclude<DataTableRowsSaveResult, void> = {};
            for (const edit of edits)
              if (Number(edit.values.quota) > 500)
                errors[edit.rowId] = { fieldErrors: { quota: t('table.example.quotaError') } };
            persist(edits.filter((edit) => !errors[edit.rowId]));
            return errors;
          }}
          onRowAdd={(values) => {
            setRows((current) => [...current, apply({ ...initial[0]!, id: crypto.randomUUID() }, values)]);
          }}
          newRowPosition="bottom"
          newRowDefaults={() => ({
            name: '',
            quota: 100,
            notes: '',
            enabled: 'false',
            date: '2026-10-17',
            region: 'standard',
            custom: '',
          })}
          onRowDelete={(row) => setRows((current) => current.filter((item) => item.id !== row.id))}
        />
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t('table.example.cellExampleTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('table.example.cellExampleHelp')}</p>
        <DataTable
          rows={rows}
          columns={columns}
          caption={t('table.example.cellExampleTitle')}
          selectionMode="none"
          paginated={false}
          onCellEdit={({ rowId, columnId, value }) =>
            setRows((current) => current.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)))
          }
        />
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t('table.example.virtualExampleTitle')}</h3>
        <DataTable
          rows={virtualRows}
          columns={columns.slice(0, 2)}
          caption={t('table.example.virtualExampleTitle')}
          selectionMode="none"
          editMode="row"
          defaultEditingRowIds={['v0', 'v1']}
          paginated={false}
          virtualize
          rowHeight={80}
          onRowSave={({ rowId, values }) =>
            setVirtualRows((current) =>
              current.map((row) =>
                row.id === rowId ? { ...row, name: String(values.name), quota: Number(values.quota) } : row,
              ),
            )
          }
        />
      </section>
    </div>
  );
}
