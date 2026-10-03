import { useState } from 'react';
import { QueryBuilder } from '../QueryBuilder';
import { deploymentFields, deploymentQuery } from './fields';

export default function QueryBuilderBasic() {
  const [query, setQuery] = useState(deploymentQuery);
  return <QueryBuilder aria-label="Deployment filter" fields={deploymentFields} value={query} onChange={setQuery} locale="en-US" showPreview className="max-w-4xl" />;
}
