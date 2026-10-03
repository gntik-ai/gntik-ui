export interface ListInputPair {
  key: string;
  value: string;
}

const unquote = (v: string) => {
  const t = v.trim();
  if (t.length >= 2 && (t[0] === '"' || t[0] === "'") && t[t.length - 1] === t[0]) return t.slice(1, -1);
  return t;
};

/**
 * Parses pasted `KEY=value` lines (dotenv style): blank lines and `#` comments are skipped, an
 * `export ` prefix is dropped, values are unquoted. Lines without the separator become keys.
 */
export function parseListInputPairs(text: string, separator = '='): ListInputPair[] {
  const pairs: ListInputPair[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const at = line.indexOf(separator);
    const key = (at === -1 ? line : line.slice(0, at)).replace(/^export\s+/, '').trim();
    const value = at === -1 ? '' : unquote(line.slice(at + separator.length));
    if (key) pairs.push({ key, value });
  }
  return pairs;
}

/** Serialises rows back to `KEY=value` lines. */
export function formatListInputPairs(pairs: readonly ListInputPair[], separator = '='): string {
  return pairs.map((p) => `${p.key}${separator}${p.value}`).join('\n');
}
