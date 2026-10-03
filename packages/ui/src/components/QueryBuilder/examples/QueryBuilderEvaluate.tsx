import { useState } from 'react';
import { QueryBuilder } from '../QueryBuilder';
import { evaluateQuery, type QueryGroup } from '../query';
import { deploymentFields } from './fields';

const rows = [
  { name: 'api-gateway', status: 'running', replicas: 4, createdAt: '2026-02-10', public: true },
  { name: 'billing-worker', status: 'paused', replicas: 1, createdAt: '2025-11-02', public: false },
  { name: 'search-indexer', status: 'failed', replicas: 2, createdAt: '2026-03-01', public: false },
];

const initial: QueryGroup = {
  type: 'group',
  id: 'root',
  combinator: 'or',
  children: [
    { type: 'condition', id: 'a', field: 'public', operator: 'isTrue' },
    { type: 'condition', id: 'b', field: 'name', operator: 'contains', value: 'index' },
  ],
};

export default function QueryBuilderEvaluate() {
  const [query, setQuery] = useState(initial);
  const matches = rows.filter((r) => evaluateQuery(query, r, deploymentFields));
  return (
    <div className="flex max-w-4xl flex-col gap-3">
      <QueryBuilder aria-label="Row filter" fields={deploymentFields} value={query} onChange={setQuery} maxDepth={1} />
      <p className="text-[13px] text-muted-foreground">
        Matching: <span className="font-mono text-foreground">{matches.map((r) => r.name).join(', ') || 'none'}</span>
      </p>
    </div>
  );
}
