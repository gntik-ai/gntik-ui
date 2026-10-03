import { DataTable } from '../DataTable';
import { DEPLOYMENT_COLUMNS, generateDeployments, type DeploymentRow } from '../fixtures';

const ROWS = generateDeployments(5_000);

/**
 * 5,000 rows without pagination: only the rows in view are rendered (aria-rowcount and
 * aria-rowindex keep the full count). Select-all still covers every row.
 */
export default function VirtualizedDataTable() {
  return <DataTable<DeploymentRow> caption="All deployments" rows={ROWS} columns={DEPLOYMENT_COLUMNS} paginated={false} virtualContainerClassName="max-h-[28rem]" />;
}
