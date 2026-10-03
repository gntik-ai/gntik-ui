import { DEPLOYMENT_COLUMNS, type DataTableColumn, type DeploymentRow } from '@gntik-ai/blocks';

/** The kit's resource columns, with the first header renamed for projects (client modules only). */
export const projectColumns: DataTableColumn<DeploymentRow>[] = DEPLOYMENT_COLUMNS.map((c) => (c.id === 'name' ? { ...c, header: 'Project' } : c));
