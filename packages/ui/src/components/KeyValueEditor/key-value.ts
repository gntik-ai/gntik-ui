/** One row of a KeyValueEditor. `id` is stable across edits (React key, focus target). */
export interface KeyValueRow {
  id: string;
  key: string;
  value: string;
  /** Masked value (rendered as a password field with a reveal toggle). */
  secret?: boolean;
}

export type KeyValueErrorCode = 'duplicate' | 'pattern' | 'keyRequired' | 'valueRequired';
export type KeyValueErrors = Record<string, { key?: KeyValueErrorCode; value?: KeyValueErrorCode }>;

/** Environment-variable style keys: letters, digits and underscores, not starting with a digit. */
export const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

let seq = 0;
/** A new row with a unique id. */
export function createKeyValueRow(key = '', value = '', secret = false): KeyValueRow {
  seq += 1;
  return { id: `kv-${Date.now().toString(36)}-${seq}`, key, value, ...(secret ? { secret } : {}) };
}

export interface ValidateKeyValueOptions {
  /** Pattern every key must match (default ENV_KEY_PATTERN). `null` accepts any key. */
  keyPattern?: RegExp | null;
  /** Rows with a key must also have a value. */
  requireValue?: boolean;
  /** Compare keys ignoring case when looking for duplicates (default false). */
  caseInsensitive?: boolean;
}

/**
 * Per-row errors, keyed by row id. Fully empty rows are ignored; the first row with a key wins
 * and later rows with the same key are marked `duplicate`.
 */
export function validateKeyValueRows(rows: readonly KeyValueRow[], { keyPattern = ENV_KEY_PATTERN, requireValue = false, caseInsensitive = false }: ValidateKeyValueOptions = {}): KeyValueErrors {
  const errors: KeyValueErrors = {};
  const seen = new Set<string>();
  for (const row of rows) {
    const key = row.key.trim();
    if (!key && !row.value) continue;
    const entry: KeyValueErrors[string] = {};
    if (!key) entry.key = 'keyRequired';
    else if (keyPattern && !keyPattern.test(key)) entry.key = 'pattern';
    else {
      const norm = caseInsensitive ? key.toLowerCase() : key;
      if (seen.has(norm)) entry.key = 'duplicate';
      seen.add(norm);
    }
    if (requireValue && key && !row.value) entry.value = 'valueRequired';
    if (entry.key || entry.value) errors[row.id] = entry;
  }
  return errors;
}

function unquote(raw: string): string {
  const quote = raw[0];
  if ((quote === '"' || quote === "'") && raw.length >= 2) {
    let end = -1;
    for (let i = 1; i < raw.length; i++) {
      if (quote === '"' && raw[i] === '\\') i++;
      else if (raw[i] === quote) {
        end = i;
        break;
      }
    }
    if (end > 0) {
      const inner = raw.slice(1, end);
      return quote === '"' ? inner.replace(/\\([nrt"\\])/g, (_, c: string) => ({ n: '\n', r: '\r', t: '\t' })[c] ?? c) : inner;
    }
  }
  // Unquoted: an inline comment starts at " #".
  const hash = raw.search(/\s#/);
  return (hash >= 0 ? raw.slice(0, hash) : raw).trim();
}

/**
 * Parses `.env` text: one `KEY=value` per line, optional `export ` prefix, single or double
 * quotes, `#` comments (full-line or after whitespace). Lines without `=` are skipped.
 */
export function parseEnv(text: string): Array<{ key: string; value: string }> {
  const out: Array<{ key: string; value: string }> = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const body = line.startsWith('export ') ? line.slice(7).trimStart() : line;
    const eq = body.indexOf('=');
    if (eq <= 0) continue;
    const key = body.slice(0, eq).trim();
    if (!key) continue;
    out.push({ key, value: unquote(body.slice(eq + 1).trim()) });
  }
  return out;
}

/** Serialises rows to `.env` text, quoting values with spaces, quotes, `#` or newlines. Rows without a key are skipped. */
export function serializeEnv(rows: ReadonlyArray<Pick<KeyValueRow, 'key' | 'value'>>): string {
  return rows
    .filter((row) => row.key.trim())
    .map(({ key, value }) => {
      const needsQuotes = /[\s#"'=\\]/.test(value);
      const v = needsQuotes ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"` : value;
      return `${key.trim()}=${v}`;
    })
    .join('\n');
}

/**
 * Merges parsed pairs into rows: existing keys get the new value, new keys are appended, and
 * empty placeholder rows are dropped. Returns the rows and how many pairs were applied.
 */
export function mergeEnvRows(rows: readonly KeyValueRow[], pairs: ReadonlyArray<{ key: string; value: string }>): KeyValueRow[] {
  const next = rows.filter((row) => row.key.trim() || row.value).map((row) => ({ ...row }));
  for (const { key, value } of pairs) {
    const existing = next.find((row) => row.key.trim() === key);
    if (existing) existing.value = value;
    else next.push(createKeyValueRow(key, value));
  }
  return next;
}
