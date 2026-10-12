import ResourceDetailPage from '../Page';
import { shell } from './shell';

export default function TableDetail() {
  const table = {
    name: 'records',
    columns: ['id', 'title', 'created_at'],
    indexes: ['records_pkey'],
    policies: ['Members can read'],
    security: 'Row-level security enabled',
  };
  // Schema information has no history field; no timeline or empty history card is appropriate.
  return (
    <ResourceDetailPage
      readOnly
      name="Table detail"
      meta={[{ label: 'Table', value: table.name, mono: true }]}
      overviewTitle="Schema details"
      details={[
        { id: 'columns', label: 'Columns', value: table.columns.join(', '), mono: true },
        { id: 'indexes', label: 'Indexes', value: table.indexes.join(', '), mono: true },
        { id: 'policies', label: 'Policies', value: table.policies.join(', ') },
        { id: 'security', label: 'Security', value: table.security },
      ]}
      shell={shell}
    />
  );
}
