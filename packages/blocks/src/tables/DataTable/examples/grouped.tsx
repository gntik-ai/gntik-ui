import { DataTable } from '../DataTable';
import { DEPLOYMENT_COLUMNS, DEPLOYMENT_ROWS, type DeploymentRow } from '../fixtures';

/** Deployments grouped by region: collapsible group headers with a row count, sorting inside groups. */
export default function GroupedDataTable() {
  return (
    <DataTable<DeploymentRow>
      caption="Deployments by region"
      rows={DEPLOYMENT_ROWS}
      columns={DEPLOYMENT_COLUMNS}
      groupBy="region"
      groupLabel={(region) => <span className="font-mono">{region}</span>}
      defaultCollapsedGroups={['ap-south-1']}
      paginated={false}
      defaultSort={{ columnId: 'cost', direction: 'descending' }}
    />
  );
}
