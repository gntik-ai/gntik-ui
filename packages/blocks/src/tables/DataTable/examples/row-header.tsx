import { DataTable } from '../DataTable';
import { DEPLOYMENT_COLUMNS, DEPLOYMENT_ROWS, type DeploymentRow } from '../fixtures';

const status = DEPLOYMENT_COLUMNS.find((c) => c.id === 'status')!;
const columns = [
  status,
  ...DEPLOYMENT_COLUMNS.filter((c) => c.id !== 'status').map((c) => (c.id === 'name' ? { ...c, rowHeader: true } : c)),
];

/**
 * A status-first table. The first column does not identify the row, so the Deployment column sets
 * `rowHeader: true`: its cells are row headers and the checkbox is named after the deployment.
 */
export default function RowHeaderDataTable() {
  return (
    <DataTable<DeploymentRow>
      caption="Deployments with the name as row header"
      rows={DEPLOYMENT_ROWS}
      columns={columns}
      paginated={false}
    />
  );
}
