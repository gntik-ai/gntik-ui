import { useState } from 'react';
import { QueryBuilder } from '../QueryBuilder';
import type { QueryGroup } from '../query';
import { deploymentFields } from './fields';

const initial: QueryGroup = {
  type: 'group',
  id: 'ranges',
  combinator: 'and',
  children: [
    { type: 'condition', id: 'number', field: 'replicas', operator: 'between', value: [10, 5] },
    {
      type: 'condition',
      id: 'date',
      field: 'createdAt',
      operator: 'between',
      value: ['2026-03-10', '2026-03-01'],
    },
  ],
};

/** Correct either end of a range to remove its linked validation message. */
export default function QueryBuilderRanges() {
  const [query, setQuery] = useState(initial);
  return (
    <QueryBuilder
      fields={deploymentFields}
      value={query}
      onChange={setQuery}
      locale="en-US"
      maxDepth={1}
      className="max-w-4xl"
    />
  );
}
