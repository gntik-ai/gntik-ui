/**
 * QueryBuilder model: a serialisable tree of AND/OR groups and field conditions, plus pure
 * helpers to describe it (`queryToString`) and to test a record against it (`evaluateQuery`).
 */
import { interpolate } from '../../i18n/format';
import { catalogs } from '../../i18n/messages';
import { en, type MessageKey, type Messages } from '../../i18n/messages/en';

export type QueryFieldType = 'text' | 'number' | 'enum' | 'date' | 'boolean';

export type QueryOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'notIn'
  | 'before'
  | 'after'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isTrue'
  | 'isFalse';

export interface QueryFieldOption {
  value: string;
  label: string;
}

export interface QueryField {
  id: string;
  label: string;
  type: QueryFieldType;
  /** Choices of an `enum` field. */
  options?: QueryFieldOption[];
  /** Restricts the operators offered (defaults to every operator of the type). */
  operators?: QueryOperator[];
}

/**
 * A condition's value: text, number, boolean, an option list (`in` / `notIn`), a `[from, to]`
 * pair (`between`) or null. Dates are `YYYY-MM-DD` strings.
 */
export type QueryValue = string | number | boolean | string[] | [number | null, number | null] | [string, string] | null;

export interface QueryCondition {
  type: 'condition';
  id: string;
  /** A `QueryField.id`. */
  field: string;
  operator: QueryOperator;
  value?: QueryValue;
}

export interface QueryGroup {
  type: 'group';
  id: string;
  combinator: 'and' | 'or';
  children: QueryNode[];
}

export type QueryNode = QueryCondition | QueryGroup;

/** Operators per field type, in menu order. */
export const QUERY_OPERATORS: Record<QueryFieldType, QueryOperator[]> = {
  text: ['eq', 'neq', 'contains', 'notContains', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'isEmpty', 'isNotEmpty'],
  enum: ['eq', 'neq', 'in', 'notIn', 'isEmpty', 'isNotEmpty'],
  date: ['eq', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  boolean: ['isTrue', 'isFalse'],
};

export const operatorsFor = (field: QueryField | undefined): QueryOperator[] => (field ? (field.operators ?? QUERY_OPERATORS[field.type]) : []);

/** How many values an operator takes: none, one, a `[from, to]` pair, or a list. */
export function operatorArity(op: QueryOperator): 'none' | 'one' | 'pair' | 'list' {
  if (op === 'isEmpty' || op === 'isNotEmpty' || op === 'isTrue' || op === 'isFalse') return 'none';
  if (op === 'between') return 'pair';
  if (op === 'in' || op === 'notIn') return 'list';
  return 'one';
}

/** A fresh node id (call it from event handlers, not during render). */
export const newQueryId = () => `q${Math.random().toString(36).slice(2, 10)}`;

export function createQueryGroup(combinator: 'and' | 'or' = 'and', children: QueryNode[] = []): QueryGroup {
  return { type: 'group', id: newQueryId(), combinator, children };
}

export function createQueryCondition(field: QueryField | undefined): QueryCondition {
  return { type: 'condition', id: newQueryId(), field: field?.id ?? '', operator: operatorsFor(field)[0] ?? 'eq' };
}

/** True when a condition has the values its operator needs. */
export function isConditionComplete(c: QueryCondition): boolean {
  const arity = operatorArity(c.operator);
  if (!c.field) return false;
  if (arity === 'none') return true;
  const v = c.value;
  if (arity === 'pair') return Array.isArray(v) && v.length === 2 && v.every((x) => x !== '' && x !== null && x !== undefined);
  if (arity === 'list') return Array.isArray(v) && v.length > 0;
  return v !== undefined && v !== null && v !== '';
}

// ------------------------------------------------------------------ queryToString

export interface QueryToStringOptions {
  /** Field definitions: labels for fields and enum options. Without them, ids are shown. */
  fields?: QueryField[];
  /** Picks the built-in catalog for operator words ("en" default). */
  locale?: string;
  /** Translator (e.g. `useI18n().t`); overrides `locale`. */
  t?: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

/**
 * Human-readable query: `Status is "Active" AND (Age greater than 30 OR Country is any of
 * "Spain", "France")`. Incomplete conditions and empty groups are left out.
 */
export function queryToString(tree: QueryNode, options: QueryToStringOptions = {}): string {
  const lang = (options.locale ?? 'en').split(/[-_]/)[0]?.toLowerCase() ?? 'en';
  const messages: Messages = (catalogs as Record<string, Messages | undefined>)[lang] ?? en;
  const t = options.t ?? ((key: MessageKey, vars?: Record<string, string | number>) => interpolate(messages[key] ?? en[key], vars, options.locale ?? 'en'));
  const fieldOf = (id: string) => options.fields?.find((f) => f.id === id);

  const literal = (field: QueryField | undefined, v: unknown): string => {
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return t(v ? 'queryBuilder.true' : 'queryBuilder.false');
    const s = String(v);
    const label = field?.options?.find((o) => o.value === s)?.label ?? s;
    return field?.type === 'date' ? label : `"${label}"`;
  };

  const visit = (node: QueryNode, nested: boolean): string => {
    if (node.type === 'condition') {
      if (!isConditionComplete(node)) return '';
      const field = fieldOf(node.field);
      const head = `${field?.label ?? node.field} ${t(`queryBuilder.op.${node.operator}`)}`;
      const arity = operatorArity(node.operator);
      const v = node.value;
      if (arity === 'none') return head;
      if (arity === 'pair' && Array.isArray(v)) return `${head} ${t('queryBuilder.between', { from: literal(field, v[0]), to: literal(field, v[1]) })}`;
      if (arity === 'list' && Array.isArray(v)) return `${head} ${(v as unknown[]).map((x) => literal(field, x)).join(', ')}`;
      return `${head} ${literal(field, v)}`;
    }
    const parts = node.children.map((c) => visit(c, true)).filter(Boolean);
    const joined = parts.join(` ${t(node.combinator === 'and' ? 'queryBuilder.and' : 'queryBuilder.or')} `);
    return nested && parts.length > 1 ? `(${joined})` : joined;
  };
  return visit(tree, false);
}

// ------------------------------------------------------------------ evaluateQuery

const DAY = /^\d{4}-\d{2}-\d{2}/;
const pad = (n: number) => String(n).padStart(2, '0');

/** `YYYY-MM-DD` of a Date (local) or of a date/datetime string; null otherwise. */
function dayKey(v: unknown): string | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  if (typeof v === 'string' && DAY.test(v)) return v.slice(0, 10);
  return null;
}

const isEmptyValue = (v: unknown) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
const norm = (v: unknown) => String(v ?? '').toLowerCase();

function compare(a: unknown, b: unknown, type: QueryFieldType | undefined): number | null {
  if (type === 'date' || (type === undefined && dayKey(b) !== null && dayKey(a) !== null)) {
    const x = dayKey(a);
    const y = dayKey(b);
    return x === null || y === null ? null : x < y ? -1 : x > y ? 1 : 0;
  }
  const x = typeof a === 'number' ? a : Number(a);
  const y = typeof b === 'number' ? b : Number(b);
  if (a === null || a === undefined || a === '' || Number.isNaN(x) || Number.isNaN(y)) return null;
  return x - y;
}

function equals(a: unknown, b: unknown, type: QueryFieldType | undefined): boolean {
  if (Array.isArray(a)) return a.some((x) => equals(x, b, type));
  if (type === 'number' || typeof b === 'number') return compare(a, b, 'number') === 0;
  if (type === 'date') return compare(a, b, 'date') === 0;
  if (type === 'enum') return String(a) === String(b);
  return norm(a) === norm(b);
}

function test(c: QueryCondition, record: Record<string, unknown>, type: QueryFieldType | undefined): boolean {
  const v = record[c.field];
  const target = c.value;
  switch (c.operator) {
    case 'isEmpty':
      return isEmptyValue(v);
    case 'isNotEmpty':
      return !isEmptyValue(v);
    case 'isTrue':
      return v === true;
    case 'isFalse':
      return v === false;
    case 'eq':
      return equals(v, target, type);
    case 'neq':
      return !equals(v, target, type);
    case 'contains':
      return norm(v).includes(norm(target));
    case 'notContains':
      return !norm(v).includes(norm(target));
    case 'startsWith':
      return norm(v).startsWith(norm(target));
    case 'endsWith':
      return norm(v).endsWith(norm(target));
    case 'in':
    case 'notIn': {
      const list = Array.isArray(target) ? (target as unknown[]).map(String) : [];
      const hit = Array.isArray(v) ? v.some((x) => list.includes(String(x))) : list.includes(String(v));
      return c.operator === 'in' ? hit : !hit;
    }
    case 'between': {
      if (!Array.isArray(target)) return false;
      const lo = compare(v, target[0], type);
      const hi = compare(v, target[1], type);
      return lo !== null && hi !== null && lo >= 0 && hi <= 0;
    }
    default: {
      const d = compare(v, target, c.operator === 'before' || c.operator === 'after' ? 'date' : type);
      if (d === null) return false;
      if (c.operator === 'gt' || c.operator === 'after') return d > 0;
      if (c.operator === 'gte') return d >= 0;
      if (c.operator === 'lt' || c.operator === 'before') return d < 0;
      return d <= 0;
    }
  }
}

const hasCompleteCondition = (node: QueryNode): boolean =>
  node.type === 'condition' ? isConditionComplete(node) : node.children.some(hasCompleteCondition);

/**
 * Whether `record` matches the query. Text comparisons ignore case; dates compare by day
 * (`YYYY-MM-DD` strings or Date objects); array-valued record fields match `eq` / `in` when any
 * item does. Incomplete conditions are ignored, and an empty group matches everything.
 * Pass `fields` so values are compared by their declared type.
 */
export function evaluateQuery(tree: QueryNode, record: Record<string, unknown>, fields?: QueryField[]): boolean {
  if (tree.type === 'condition') {
    if (!isConditionComplete(tree)) return true;
    return test(tree, record, fields?.find((f) => f.id === tree.field)?.type);
  }
  const relevant = tree.children.filter(hasCompleteCondition);
  if (!relevant.length) return true;
  return tree.combinator === 'and' ? relevant.every((c) => evaluateQuery(c, record, fields)) : relevant.some((c) => evaluateQuery(c, record, fields));
}
