import { deploymentFields, deploymentQuery } from './examples/fields';
import { evaluateQuery, isConditionComplete, operatorsFor, queryToString, type QueryGroup } from './query';

const q = (combinator: 'and' | 'or', children: QueryGroup['children']): QueryGroup => ({ type: 'group', id: 'r', combinator, children });

describe('queryToString', () => {
  it('describes nested groups with labels', () => {
    expect(queryToString(deploymentQuery, { fields: deploymentFields })).toBe(
      'Status is any of "Running", "Paused" AND (Replicas at least 3 OR Created is after 2026-01-01)',
    );
  });

  it('falls back to ids, skips incomplete conditions and empty groups, and translates', () => {
    const tree = q('or', [
      { type: 'condition', id: 'a', field: 'age', operator: 'between', value: [18, 30] },
      { type: 'condition', id: 'b', field: 'name', operator: 'contains' },
      { type: 'group', id: 'g', combinator: 'and', children: [] },
      { type: 'condition', id: 'c', field: 'deleted', operator: 'isEmpty' },
    ]);
    expect(queryToString(tree)).toBe('age is between 18 and 30 OR deleted is empty');
    expect(queryToString(tree, { locale: 'es' })).toBe('age está entre 18 y 30 O deleted está vacío');
  });
});

describe('evaluateQuery', () => {
  const rec = { name: 'API Gateway', status: 'running', replicas: 4, createdAt: '2026-02-10', public: true, tags: ['edge', 'prod'], owner: '' };

  it('evaluates nested AND / OR groups', () => {
    expect(evaluateQuery(deploymentQuery, rec, deploymentFields)).toBe(true);
    expect(evaluateQuery(deploymentQuery, { ...rec, status: 'failed' }, deploymentFields)).toBe(false);
    expect(evaluateQuery(deploymentQuery, { ...rec, replicas: 1, createdAt: '2025-12-31' }, deploymentFields)).toBe(false);
    expect(evaluateQuery(deploymentQuery, { ...rec, replicas: 1 }, deploymentFields)).toBe(true);
  });

  it.each([
    ['name', 'contains', 'gate', true],
    ['name', 'eq', 'api gateway', true],
    ['name', 'startsWith', 'web', false],
    ['name', 'endsWith', 'WAY', true],
    ['name', 'notContains', 'api', false],
    ['replicas', 'gt', 3, true],
    ['replicas', 'lte', 3, false],
    ['replicas', 'between', [4, 10], true],
    ['createdAt', 'before', '2026-03-01', true],
    ['createdAt', 'between', ['2026-02-10', '2026-02-10'], true],
    ['createdAt', 'eq', '2026-02-10', true],
    ['status', 'notIn', ['failed'], true],
    ['tags', 'eq', 'prod', true],
    ['tags', 'in', ['qa'], false],
    ['public', 'isTrue', undefined, true],
    ['public', 'isFalse', undefined, false],
    ['owner', 'isEmpty', undefined, true],
    ['missing', 'isNotEmpty', undefined, false],
  ] as const)('%s %s %j → %s', (field, operator, value, expected) => {
    const tree = q('and', [{ type: 'condition', id: 'x', field, operator, value: value as never }]);
    expect(evaluateQuery(tree, rec, deploymentFields)).toBe(expected);
  });

  it('ignores incomplete conditions and matches everything when empty', () => {
    expect(evaluateQuery(q('and', []), rec)).toBe(true);
    expect(evaluateQuery(q('or', [{ type: 'condition', id: 'x', field: 'name', operator: 'eq' }, { type: 'group', id: 'g', combinator: 'and', children: [] }]), rec)).toBe(true);
    expect(isConditionComplete({ type: 'condition', id: 'x', field: 'replicas', operator: 'between', value: [1, null] })).toBe(false);
  });

  it('dates compare by day for Date objects too', () => {
    const tree = q('and', [{ type: 'condition', id: 'x', field: 'at', operator: 'after', value: '2026-01-01' }]);
    expect(evaluateQuery(tree, { at: new Date(2026, 0, 2, 8) })).toBe(true);
    expect(evaluateQuery(tree, { at: new Date(2026, 0, 1, 23) })).toBe(false);
  });

  it('operators per type', () => {
    expect(operatorsFor(deploymentFields.find((f) => f.id === 'public'))).toEqual(['isTrue', 'isFalse']);
    expect(operatorsFor({ id: 'x', label: 'X', type: 'text', operators: ['eq'] })).toEqual(['eq']);
  });
});
