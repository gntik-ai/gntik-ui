/** Comparison operators a filter can use. `~` is "contains", `!~` "does not contain". */
export type PowerSearchOperator = '=' | '!=' | '>' | '>=' | '<' | '<=' | '~' | '!~';
export type PowerSearchFieldType = 'string' | 'number' | 'enum' | 'date';

export interface PowerSearchValueOption {
  value: string;
  label?: string;
}

export interface PowerSearchField<K extends string = string> {
  key: K;
  /** Display name (defaults to the key). */
  label?: string;
  type?: PowerSearchFieldType;
  /** Allowed operators (default by type). */
  operators?: PowerSearchOperator[];
  /** Value suggestions; enum fields accept only these. */
  values?: Array<string | PowerSearchValueOption>;
  description?: string;
}

export interface PowerSearchFilter<K extends string = string> {
  type: 'filter';
  field: K;
  operator: PowerSearchOperator;
  /** Numbers for number fields, strings otherwise. */
  value: string | number;
}

export interface PowerSearchText {
  type: 'text';
  value: string;
}

export type PowerSearchTerm<K extends string = string> = PowerSearchFilter<K> | PowerSearchText;

/** The query AST: every term must match (AND). */
export interface PowerSearchQuery<K extends string = string> {
  type: 'and';
  terms: PowerSearchTerm<K>[];
}

export const POWER_SEARCH_OPERATORS: PowerSearchOperator[] = ['=', '!=', '>', '>=', '<', '<=', '~', '!~'];

export const defaultOperatorLabels: Record<PowerSearchOperator, string> = {
  '=': 'is',
  '!=': 'is not',
  '>': 'greater than',
  '>=': 'at least',
  '<': 'less than',
  '<=': 'at most',
  '~': 'contains',
  '!~': 'does not contain',
};

const BY_TYPE: Record<PowerSearchFieldType, PowerSearchOperator[]> = {
  string: ['=', '!=', '~', '!~'],
  enum: ['=', '!='],
  number: ['=', '!=', '>', '>=', '<', '<='],
  date: ['=', '>', '>=', '<', '<='],
};

export const emptyPowerSearchQuery = <K extends string = string>(): PowerSearchQuery<K> => ({ type: 'and', terms: [] });

export function operatorsFor(field: PowerSearchField): PowerSearchOperator[] {
  return field.operators ?? BY_TYPE[field.type ?? 'string'];
}

export function valueOptions(field: PowerSearchField): PowerSearchValueOption[] {
  return (field.values ?? []).map((v) => (typeof v === 'string' ? { value: v } : v));
}

export function findField<K extends string>(fields: readonly PowerSearchField<K>[], name: string): PowerSearchField<K> | undefined {
  const n = name.toLowerCase();
  return fields.find((f) => f.key.toLowerCase() === n) ?? fields.find((f) => f.label?.toLowerCase() === n);
}

/** Coerces a typed value for its field: numbers for number fields; null when invalid. */
export function coerceValue(field: PowerSearchField, raw: string): string | number | null {
  const v = raw.trim();
  if (!v) return null;
  if (field.type === 'number') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (field.type === 'enum') {
    const hit = valueOptions(field).find((o) => o.value.toLowerCase() === v.toLowerCase() || o.label?.toLowerCase() === v.toLowerCase());
    return hit ? hit.value : null;
  }
  return v;
}

const quote = (v: string) => (/[\s"]/.test(v) || v === '' ? `"${v.replace(/"/g, '\\"')}"` : v);

/** Serialises the AST: `status = failed region != eu "free text"`. */
export function formatPowerSearch(query: PowerSearchQuery): string {
  return query.terms.map((t) => (t.type === 'text' ? quote(t.value) : `${t.field} ${t.operator} ${quote(String(t.value))}`)).join(' ');
}

/** Splits on whitespace, keeping quoted runs together (quotes removed, \" unescaped). */
function tokenize(input: string): string[] {
  const out: string[] = [];
  const re = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) out.push(m[1] !== undefined ? m[1].replace(/\\"/g, '"') : (m[2] ?? ''));
  return out;
}

const OP_RE = /^(!=|>=|<=|!~|=|>|<|~|:)$/;
const INLINE_RE = /^([\w.-]+)(!=|>=|<=|!~|=|>|<|~|:)(.*)$/;

/** Parses one `field<op>value` string (spaces optional, `:` means `=`), or null. */
export function parsePowerSearchFilter<K extends string>(text: string, fields: readonly PowerSearchField<K>[]): PowerSearchFilter<K> | null {
  const m = text.trim().match(/^([\w.-]+)\s*(!=|>=|<=|!~|=|>|<|~|:)\s*(.+)$/);
  if (!m) return null;
  const field = findField(fields, m[1] ?? '');
  const op = (m[2] === ':' ? '=' : m[2]) as PowerSearchOperator;
  if (!field || !operatorsFor(field).includes(op)) return null;
  const value = coerceValue(field, tokenize(m[3] ?? '')[0] ?? '');
  return value === null ? null : { type: 'filter', field: field.key, operator: op, value };
}

/** Parses a whole query string into the AST; unknown fields and loose words become text terms. */
export function parsePowerSearch<K extends string>(input: string, fields: readonly PowerSearchField<K>[]): PowerSearchQuery<K> {
  const tokens = tokenize(input);
  const terms: PowerSearchTerm<K>[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i] ?? '';
    const inline = tok.match(INLINE_RE);
    if (inline) {
      const rest = inline[3] ? inline[3] : quote(tokens[i + 1] ?? '');
      const f = parsePowerSearchFilter(`${inline[1]}${inline[2]}${rest}`, fields);
      if (f) {
        terms.push(f);
        if (!inline[3]) i++;
        continue;
      }
    }
    const op = tokens[i + 1];
    const val = tokens[i + 2];
    if (op && OP_RE.test(op) && val !== undefined) {
      const f = parsePowerSearchFilter(`${tok}${op}${quote(val)}`, fields);
      if (f) {
        terms.push(f);
        i += 2;
        continue;
      }
    }
    terms.push({ type: 'text', value: tok });
  }
  return { type: 'and', terms };
}

function compare(actual: unknown, op: PowerSearchOperator, expected: string | number): boolean {
  if (typeof expected === 'number') {
    const a = Number(actual);
    if (!Number.isFinite(a)) return false;
    return { '=': a === expected, '!=': a !== expected, '>': a > expected, '>=': a >= expected, '<': a < expected, '<=': a <= expected, '~': String(a).includes(String(expected)), '!~': !String(a).includes(String(expected)) }[op];
  }
  const a = String(actual ?? '').toLowerCase();
  const e = expected.toLowerCase();
  return { '=': a === e, '!=': a !== e, '>': a > e, '>=': a >= e, '<': a < e, '<=': a <= e, '~': a.includes(e), '!~': !a.includes(e) }[op];
}

/** Client-side matcher for the AST: filters compare `record[field]`, text terms search every value. */
export function matchPowerSearch<K extends string>(query: PowerSearchQuery<K>, record: Partial<Record<K, unknown>>): boolean {
  return query.terms.every((t) => {
    if (t.type === 'text') {
      const needle = t.value.toLowerCase();
      return Object.values(record).some((v) => String(v ?? '').toLowerCase().includes(needle));
    }
    return compare(record[t.field], t.operator, t.value);
  });
}
