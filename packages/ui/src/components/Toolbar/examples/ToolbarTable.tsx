import { Download, Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Toolbar, ToolbarButton, ToolbarEnd, ToolbarInput, ToolbarStart } from '../Toolbar';

export default function ToolbarTable() {
  const [query, setQuery] = useState('');
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Toolbar aria-label="Deployments actions">
        <ToolbarStart className="flex-1">
          <ToolbarInput
            icon={Search}
            aria-label="Search deployments"
            placeholder="Search deployments…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            wrapperClassName="max-w-[260px]"
          />
          <ToolbarButton variant="secondary" icon={Filter}>Filters</ToolbarButton>
        </ToolbarStart>
        <ToolbarEnd>
          <ToolbarButton icon={Download} aria-label="Export CSV" />
          <ToolbarButton variant="primary" icon={Plus}>New deployment</ToolbarButton>
        </ToolbarEnd>
      </Toolbar>
      <p className="px-4 py-6 text-[13px] text-muted-foreground">
        {query ? `Results for “${query}”` : 'All deployments'}
      </p>
    </div>
  );
}
