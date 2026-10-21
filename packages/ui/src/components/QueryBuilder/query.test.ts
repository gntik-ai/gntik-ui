import { deploymentFields, deploymentQuery } from './examples/fields';
import {
  evaluateQuery,
  isConditionComplete,
  isConditionValid,
  operatorsFor,
  queryToString,
  type QueryCondition,
  type QueryGroup,
} from './query';

const q = (combinator: 'and' | 'or', children: QueryGroup['children']): QueryGroup => ({
  type: 'group',
  id: 'r',
  combinator,
  children,
});

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
  it('skips an inverted number range instead of discarding every record', () => {
    const condition = { type: 'condition', id: 'range', field: 'amount', operator: 'between', value: [10, 5] } as const;
    const records = [{ amount: 3 }, { amount: 7 }, { amount: 12 }];
    expect(records.filter((record) => evaluateQuery({ ...condition, value: [10, 5] }, record))).toEqual(records);
  });

  const rec = {
    name: 'API Gateway',
    status: 'running',
    replicas: 4,
    createdAt: '2026-02-10',
    public: true,
    tags: ['edge', 'prod'],
    owner: '',
  };

  it('evaluates nested AND / OR groups', () => {
    expect(evaluateQuery(deploymentQuery, rec, deploymentFields)).toBe(true);
    expect(evaluateQuery(deploymentQuery, { ...rec, status: 'failed' }, deploymentFields)).toBe(false);
    expect(evaluateQuery(deploymentQuery, { ...rec, replicas: 1, createdAt: '2025-12-31' }, deploymentFields)).toBe(
      false,
    );
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
    expect(
      evaluateQuery(
        q('or', [
          { type: 'condition', id: 'x', field: 'name', operator: 'eq' },
          { type: 'group', id: 'g', combinator: 'and', children: [] },
        ]),
        rec,
      ),
    ).toBe(true);
    expect(
      isConditionComplete({ type: 'condition', id: 'x', field: 'replicas', operator: 'between', value: [1, null] }),
    ).toBe(false);
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

it.each([
  ['contains', 'funcion', true],
  ['notContains', 'funcion', false],
  ['startsWith', 'func', true],
  ['endsWith', 'cion', true],
  ['eq', 'funcion', false],
  ['neq', 'funcion', true],
  ['in', ['funcion'], false],
  ['notIn', ['funcion'], true],
] as const)('keeps the accent policy for %s', (operator, value, expected) => {
  expect(
    evaluateQuery(
      { type: 'condition', id: 'name', field: 'name', operator, value: typeof value === 'string' ? value : [...value] },
      { name: 'Función' },
    ),
  ).toBe(expected);
});

describe('between range validity', () => {
  const range = (value: QueryCondition['value']): QueryCondition => ({
    type: 'condition',
    id: 'range',
    field: 'amount',
    operator: 'between',
    value,
  });

  it.each([
    [[10, 5], false],
    [[5, 10], true],
    [[5, 5], true],
    [['2026-03-10', '2026-03-01'], false],
    [['2026-03-01', '2026-03-01'], true],
    [['2026-03-01T23:59:00', '2026-03-01T00:00:00'], true],
    [['2026-03-01', '2026-03-10'], true],
    [['z', 'a'], true],
    [['10', '5'], true],
    [[10, '5'], true],
  ] as const)('validates %j as %s', (value, expected) => {
    expect(isConditionValid(range([...value] as QueryCondition['value']))).toBe(expected);
  });

  it('leaves incomplete pairs incomplete without throwing, and accepts other complete operators', () => {
    const incomplete = range([1, null]);
    expect(isConditionComplete(incomplete)).toBe(false);
    expect(() => isConditionValid(incomplete)).not.toThrow();
    expect(isConditionValid({ ...range(10), operator: 'gt' })).toBe(true);
    expect(isConditionComplete(range([10, 5]))).toBe(true);
  });

  it.each(['and', 'or'] as const)('ignores inverted ranges in nested %s groups', (combinator) => {
    const records = [{ amount: 3 }, { amount: 7 }, { amount: 12 }];
    const invalid = range([10, 5]);
    const onlyInvalid = q(combinator, [invalid]);
    const sibling: QueryCondition = { ...range(7), operator: 'eq' };
    expect(records.filter((record) => evaluateQuery(onlyInvalid, record))).toEqual(records);
    expect(records.filter((record) => evaluateQuery(q(combinator, [invalid, sibling]), record))).toEqual([
      { amount: 7 },
    ]);
    expect(records.filter((record) => evaluateQuery(q(combinator, [onlyInvalid, sibling]), record))).toEqual([
      { amount: 7 },
    ]);
    expect(records.filter((record) => evaluateQuery(range([5, 10]), record))).toEqual([{ amount: 7 }]);
  });

  it('matches only the same day, including datetime values', () => {
    const condition = { ...range(['2026-03-01', '2026-03-01']), field: 'createdAt' };
    const records = [
      { createdAt: '2026-02-28T23:59:00' },
      { createdAt: '2026-03-01' },
      { createdAt: '2026-03-01T23:59:00' },
      { createdAt: '2026-03-02' },
    ];
    expect(records.filter((record) => evaluateQuery(condition, record))).toEqual([
      { createdAt: '2026-03-01' },
      { createdAt: '2026-03-01T23:59:00' },
    ]);
  });
});
