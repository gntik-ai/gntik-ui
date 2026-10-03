import { DataTable } from '../DataTable';
import { DEPLOYMENT_COLUMNS, DEPLOYMENT_ROWS, type DeploymentRow } from '../fixtures';

/**
 * Resizable columns (drag a header edge, or focus it and use the arrow keys) with the name pinned
 * to the start and the cost pinned to the end: they stay in view while the table scrolls sideways.
 */
export default function ResizablePinnedDataTable() {
  return (
    <DataTable<DeploymentRow>
      caption="Deployments"
      rows={DEPLOYMENT_ROWS}
      columns={DEPLOYMENT_COLUMNS}
      resizable
      defaultColumnWidths={{ name: 220, region: 180, status: 160, requests: 160, cost: 140, updated: 160 }}
      defaultPinnedColumns={{ left: ['name'], right: ['cost'] }}
      rowActions={() => [{ label: 'Open' }, { label: 'Redeploy' }]}
    />
  );
}
