import { useState } from 'react';
import { DataTable, type DataTableExportRequest } from '../DataTable';
import { DEPLOYMENT_COLUMNS, generateDeployments } from '../fixtures';

const rows = generateDeployments(95);
const columns = DEPLOYMENT_COLUMNS.map((column) => ({
  ...column,
  // A custom export value can differ from the displayed cell. Other values stay raw.
  exportValue: column.id === 'name' ? (row: (typeof rows)[number]) => `${row.name} / ${row.region}` : undefined,
  exportable: column.id !== 'status',
}));

/** CSV uses raw values and formula protection. Use onExport for large or server-side results. */
export default function CsvExportExample() {
  const [request, setRequest] = useState<DataTableExportRequest | null>(null);
  return (
    <div className="space-y-6">
      <section className="space-y-3" aria-label="Client CSV export">
        <p className="text-sm text-muted-foreground">
          Export all rows, the current page, or the selected rows across pages. Copy selected rows from the menu or
          press Ctrl/Cmd+C inside the table without selecting text. Hidden columns and Status are omitted; Name uses
          exportValue. Dates export as ISO strings and numbers remain unformatted.
        </p>
        <DataTable
          caption="Deployments"
          rows={rows}
          columns={columns}
          hiddenColumns={['region']}
          defaultSelectedIds={[rows[1]!.id, rows[14]!.id]}
          defaultSort={{ columnId: 'name', direction: 'ascending' }}
          selectAllMatching
          csvExport={{ fileName: 'deployments.csv', scopes: ['rows', 'page', 'selected'] }}
        />
      </section>
      <section className="space-y-3" aria-label="Delegated server export">
        <p className="text-sm text-muted-foreground">
          For large result sets, onExport handles the request instead of building a file in the browser. The trigger
          stays focusable and busy until it settles. The consumer owns error feedback and fetching all server rows.
          Server tables omit clipboard copying because selected rows may be on unloaded pages.
        </p>
        <DataTable
          caption="Server deployments"
          rows={rows.slice(0, 10)}
          columns={columns}
          paginationMode="server"
          page={1}
          pageSize={10}
          rowCount={95}
          defaultSelectedIds={[rows[1]!.id, rows[14]!.id]}
          csvExport
          onExport={async (next) => {
            await new Promise<void>((resolve) => setTimeout(resolve, 500));
            setRequest(next);
          }}
          labels={{ export: 'Request export' }}
        />
        <p role="status" className="text-sm text-muted-foreground">
          {request ? `Requested ${request.scope}: ${request.columns.join(', ')}` : 'No export requested.'}
        </p>
      </section>
      <section className="space-y-3" aria-label="Single row export">
        <DataTable
          caption="One deployment"
          rows={rows.slice(0, 3)}
          columns={columns}
          selectionMode="single"
          legend="Choose a deployment to export"
          defaultSelectedId={rows[0]!.id}
          csvExport={{ scopes: ['selected'] }}
        />
      </section>
    </div>
  );
}
