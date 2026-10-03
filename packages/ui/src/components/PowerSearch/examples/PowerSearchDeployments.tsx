import { useState } from 'react';
import { PowerSearch } from '../PowerSearch';
import { formatPowerSearch, matchPowerSearch, parsePowerSearch, type PowerSearchQuery } from '../power-search-query';
import { deploymentFields, deployments, type DeploymentField } from './fields';

export default function PowerSearchDeployments() {
  const [query, setQuery] = useState<PowerSearchQuery<DeploymentField>>(() => parsePowerSearch('status=failed', deploymentFields));
  const rows = deployments.filter((d) => matchPowerSearch(query, d));
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <PowerSearch aria-label="Filter deployments" fields={deploymentFields} value={query} onValueChange={setQuery} />
      <p className="font-mono text-[11.5px] text-muted-foreground">{formatPowerSearch(query) || 'No filters'}</p>
      <ul aria-label="Matching deployments" className="divide-y divide-border rounded-lg border border-border bg-card text-[12.5px]">
        {rows.map((d) => (
          <li key={d.id} className="flex items-center gap-3 px-3 py-2">
            <span className="font-mono text-muted-foreground">{d.id}</span>
            <span className="min-w-0 flex-1 truncate text-foreground">{d.project}</span>
            <span className="text-muted-foreground">{d.region}</span>
            <span className="w-20 text-end">{d.status}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="px-3 py-4 text-center text-muted-foreground">No deployments match.</li>}
      </ul>
    </div>
  );
}
