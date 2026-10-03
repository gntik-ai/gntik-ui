import type { QueryField, QueryGroup } from '../query';

/** Example fields: a generic list of deployments. */
export const deploymentFields: QueryField[] = [
  { id: 'name', label: 'Name', type: 'text' },
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    options: [
      { value: 'running', label: 'Running' },
      { value: 'paused', label: 'Paused' },
      { value: 'failed', label: 'Failed' },
    ],
  },
  { id: 'replicas', label: 'Replicas', type: 'number' },
  { id: 'createdAt', label: 'Created', type: 'date' },
  { id: 'public', label: 'Public', type: 'boolean' },
];

export const deploymentQuery: QueryGroup = {
  type: 'group',
  id: 'root',
  combinator: 'and',
  children: [
    { type: 'condition', id: 'c1', field: 'status', operator: 'in', value: ['running', 'paused'] },
    {
      type: 'group',
      id: 'g1',
      combinator: 'or',
      children: [
        { type: 'condition', id: 'c2', field: 'replicas', operator: 'gte', value: 3 },
        { type: 'condition', id: 'c3', field: 'createdAt', operator: 'after', value: '2026-01-01' },
      ],
    },
  ],
};
