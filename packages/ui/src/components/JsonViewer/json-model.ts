import { foldText } from '../../utils/match-text';
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

/** Folded node text and its ancestors, reusable while only the query changes. */
export function jsonSearchIndex(data: unknown, maxDepth = Infinity, locale?: string) {
  const out: Array<{ text: string; ancestors: string[] }> = [];
  const walk = (value: unknown, path: string, depth: number, ancestors: string[]) => {
    for (const [k, v] of entries(value)) {
      const p = joinPath(path, k);
      const type = jsonType(v);
      const primitive = type !== 'object' && type !== 'array';
      out.push({ text: foldText(String(k), locale), ancestors });
      if (primitive) out.push({ text: foldText(String(v), locale), ancestors });
      if (!primitive && depth < maxDepth) walk(v, p, depth + 1, [...ancestors, p]);
    }
  };
  walk(data, '', 1, []);
  return out;
}

export function ancestorsFromIndex(index: ReturnType<typeof jsonSearchIndex>, query: string, locale?: string) {
  const q = foldText(query.trim(), locale);
  const out = new Set<string>();
  if (q)
    for (const node of index) {
      if (node.text.indexOf(q) !== -1) node.ancestors.forEach((a) => out.add(a));
    }
  return out;
}

/** Paths of every container whose subtree contains a key or primitive value matching `query`. */
export function matchAncestors(data: unknown, query: string, maxDepth = Infinity, locale?: string) {
  return ancestorsFromIndex(jsonSearchIndex(data, maxDepth, locale), query, locale);
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
