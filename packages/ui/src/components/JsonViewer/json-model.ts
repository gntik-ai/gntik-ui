export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type JsonType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

/** Measures strings as-is and other JSON values with two-space indentation. */
export function measureJsonDisplay(value: unknown, maxDisplayChars?: number) {
  if (maxDisplayChars === undefined || !Number.isInteger(maxDisplayChars) || maxDisplayChars < 1) return;
  const empty = value === null || value === undefined || value === '';
  if (empty) return { text: '', displayText: '', truncated: false, empty: true };
  const text = typeof value === 'string' ? value : (JSON.stringify(value, null, 2) ?? '');
  const truncated = text.length > maxDisplayChars;
  let cut = text.slice(0, maxDisplayChars);
  const last = cut.charCodeAt(cut.length - 1);
  if (last >= 0xd800 && last <= 0xdbff) cut = cut.slice(0, -1);
  return { text, displayText: truncated ? `${cut}…` : text, truncated, empty };
}

export function jsonType(value: unknown): JsonType {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  return t === 'string' || t === 'number' || t === 'boolean' ? t : 'object';
}

/** Child entries of an object or array (`[]` for primitives). */
export function entries(value: unknown): Array<[key: string | number, value: unknown]> {
  if (Array.isArray(value)) return value.map((v, i) => [i, v]);
  if (value && typeof value === 'object') return Object.entries(value);
  return [];
}

const IDENT = /^[A-Za-z_$][\w$]*$/;

/** Appends a key to a path: `users[0].name`, `meta["content-type"]`. */
export function joinPath(parent: string, key: string | number) {
  if (typeof key === 'number') return `${parent}[${key}]`;
  if (IDENT.test(key)) return parent ? `${parent}.${key}` : key;
  return `${parent}[${JSON.stringify(key)}]`;
}

/** Paths of every container whose subtree contains a key or primitive value matching `query`. */
export function matchAncestors(data: unknown, query: string, maxDepth = Infinity) {
  const q = query.trim().toLowerCase();
  const out = new Set<string>();
  if (!q) return out;
  const walk = (value: unknown, path: string, depth: number, ancestors: string[]) => {
    for (const [k, v] of entries(value)) {
      const p = joinPath(path, k);
      const type = jsonType(v);
      const primitive = type !== 'object' && type !== 'array';
      if (String(k).toLowerCase().includes(q) || (primitive && String(v).toLowerCase().includes(q)))
        ancestors.forEach((a) => out.add(a));
      if (!primitive && depth < maxDepth) walk(v, p, depth + 1, [...ancestors, p]);
    }
  };
  walk(data, '', 1, []);
  return out;
}

/** Container paths up to (not including) `depth` levels, for the initial expansion. */
export function pathsToDepth(data: unknown, depth: number) {
  const out: string[] = [];
  const walk = (value: unknown, path: string, level: number) => {
    if (level > depth) return;
    for (const [k, v] of entries(value)) {
      const p = joinPath(path, k);
      const t = jsonType(v);
      if (t === 'object' || t === 'array') {
        if (level < depth) out.push(p);
        walk(v, p, level + 1);
      }
    }
  };
  walk(data, '', 0);
  return out;
}
