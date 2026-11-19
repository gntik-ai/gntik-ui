import { useRef, useState } from 'react';
import { Button, useI18n } from '@gntik-ai/ui';
import { DataTable, type DataTableHandle } from '../DataTable';
import { DEPLOYMENT_ROWS, generateDeployments, type DeploymentRow } from '../fixtures';

const virtualRows = generateDeployments(1000);
const href = (row: DeploymentRow) => `/deployments/${row.id}`;

export default function RowActivationExample() {
  const { t } = useI18n();
  const paged = useRef<DataTableHandle>(null);
  const virtual = useRef<DataTableHandle>(null);
  const [active, setActive] = useState<string | null>(null);
  const columns = [
    {
      id: 'name',
      header: t('table.example.quickFilter.name'),
      accessor: (row: DeploymentRow) => row.name,
      rowHeader: true,
    },
    { id: 'region', header: t('table.example.quickFilter.region'), accessor: (row: DeploymentRow) => row.region },
  ];
  const inspect = (row: DeploymentRow) => setActive(row.name);
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">{t('table.example.activation.help')}</p>
      <p role="status" aria-label={t('table.example.activation.status')} className="text-sm text-foreground">
        {active ? t('table.example.activation.selected', { name: active }) : t('table.example.activation.idle')}
      </p>
      <DataTable
        ref={paged}
        rows={DEPLOYMENT_ROWS}
        columns={columns}
        caption={t('table.example.activation.links')}
        showCaption
        getRowHref={href}
        onRowClick={(row, event) => {
          event.preventDefault();
          inspect(row);
        }}
        groupBy="region"
        defaultCollapsedGroups={['us-east-1']}
        defaultPageSize={5}
        toolbar={
          <Button
            variant="secondary"
            onClick={() => paged.current?.scrollToRow(DEPLOYMENT_ROWS[23]!.id, { align: 'center', focus: true })}
          >
            {t('table.example.activation.scrollLast')}
          </Button>
        }
      />
      <DataTable
        rows={DEPLOYMENT_ROWS.slice(0, 3)}
        columns={columns}
        caption={t('table.example.activation.callbacks')}
        showCaption
        selectable={false}
        paginated={false}
        onRowClick={inspect}
        onRowDoubleClick={inspect}
      />
      <DataTable
        rows={DEPLOYMENT_ROWS.slice(0, 3)}
        columns={columns}
        caption={t('table.example.activation.multiple')}
        showCaption
        paginated={false}
        selectionMode="multiple"
        selectOnRowClick
        isRowDisabled={(row) => row === DEPLOYMENT_ROWS[2]}
      />
      <DataTable
        rows={DEPLOYMENT_ROWS.slice(0, 3)}
        columns={columns}
        caption={t('table.example.activation.single')}
        showCaption
        selectionMode="single"
        legend={t('table.example.activation.single')}
        selectOnRowClick
        isRowDisabled={(row) => row === DEPLOYMENT_ROWS[2]}
      />
      <DataTable
        ref={virtual}
        rows={virtualRows}
        columns={columns}
        caption={t('table.example.activation.virtual')}
        showCaption
        selectable={false}
        paginated={false}
        virtualize
        rowHeight={40}
        getRowHref={href}
        onRowClick={(row, event) => {
          event.preventDefault();
          inspect(row);
        }}
        toolbar={
          <Button
            variant="secondary"
            onClick={() => virtual.current?.scrollToRow(virtualRows[800]!.id, { align: 'center', focus: true })}
          >
            {t('table.example.activation.scrollVirtual')}
          </Button>
        }
      />
    </div>
  );
}
