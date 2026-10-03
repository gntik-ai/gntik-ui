/**
 * Line and word diffs (Myers O(ND), no dependencies) plus the view model DiffViewer renders:
 * hunks with collapsed unchanged runs, and removed/added line pairs for split view and word
 * highlights.
 */

export type DiffLineType = 'unchanged' | 'added' | 'removed';

export interface DiffLine {
  type: DiffLineType;
  text: string;
  /** 1-based line number in the old text (unchanged and removed lines). */
  oldLine?: number;
  /** 1-based line number in the new text (unchanged and added lines). */
  newLine?: number;
}

export interface DiffLinesOptions {
  /** Treat lines that differ only in whitespace as unchanged (the new text is shown). */
  ignoreWhitespace?: boolean;
  /** Compare case-insensitively. */
  ignoreCase?: boolean;
}

type Edit = { op: '=' | '-' | '+'; a: number; b: number };

/** Above this many trace cells, Myers gives up and reports the middle as replaced. */
const MAX_TRACE_CELLS = 20_000_000;

/** Shortest edit script between two id sequences (Myers' greedy algorithm with backtracking). */
function myers(a: Int32Array, b: Int32Array): Edit[] {
  let start = 0;
  let endA = a.length;
  let endB = b.length;
  while (start < endA && start < endB && a[start] === b[start]) start++;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const head: Edit[] = [];
  for (let i = 0; i < start; i++) head.push({ op: '=', a: i, b: i });
  const tail: Edit[] = [];
  for (let i = 0; endA + i < a.length; i++) tail.push({ op: '=', a: endA + i, b: endB + i });

  const n = endA - start;
  const m = endB - start;
  const max = n + m;
  const off = max + 1;
  const middle: Edit[] = [];
  if (n === 0 || m === 0) {
    for (let i = 0; i < n; i++) middle.push({ op: '-', a: start + i, b: -1 });
    for (let j = 0; j < m; j++) middle.push({ op: '+', a: -1, b: start + j });
    return [...head, ...middle, ...tail];
  }

  const v = new Int32Array(2 * max + 2);
  const trace: Int32Array[] = [];
  let found = false;
  for (let d = 0; d <= max && !found; d++) {
    if ((d + 1) * v.length > MAX_TRACE_CELLS) break;
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[k - 1 + off]! < v[k + 1 + off]!) ? v[k + 1 + off]! : v[k - 1 + off]! + 1;
      let y = x - k;
      while (x < n && y < m && a[start + x] === b[start + y]) {
        x++;
        y++;
      }
      v[k + off] = x;
      if (x >= n && y >= m) {
        found = true;
        break;
      }
    }
  }

  if (!found) {
    for (let i = 0; i < n; i++) middle.push({ op: '-', a: start + i, b: -1 });
    for (let j = 0; j < m; j++) middle.push({ op: '+', a: -1, b: start + j });
    return [...head, ...middle, ...tail];
  }

  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d]!;
    const k = x - y;
    const prevK = k === -d || (k !== d && vd[k - 1 + off]! < vd[k + 1 + off]!) ? k + 1 : k - 1;
    const prevX = vd[prevK + off]!;
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      x--;
      y--;
      middle.push({ op: '=', a: start + x, b: start + y });
    }
    if (d > 0) {
      if (x === prevX) middle.push({ op: '+', a: -1, b: start + y - 1 });
      else middle.push({ op: '-', a: start + x - 1, b: -1 });
    }
    x = prevX;
    y = prevY;
  }
  middle.reverse();
  return [...head, ...middle, ...tail];
}

/** Maps each distinct (normalised) token to an integer so comparisons are cheap. */
function toIds(lists: [string[], string[]], normalise: (s: string) => string): [Int32Array, Int32Array] {
  const ids = new Map<string, number>();
  const encode = (list: string[]) =>
    Int32Array.from(list, (item) => {
      const key = normalise(item);
      let id = ids.get(key);
      if (id === undefined) {
        id = ids.size;
        ids.set(key, id);
      }
      return id;
    });
  return [encode(lists[0]), encode(lists[1])];
}

/** Splits text into lines; a single trailing newline does not add an empty line. */
export function splitLines(text: string): string[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

/**
 * Line diff of two texts. Within each changed block, removed lines come before added ones.
 * Pure: safe to call on the server or in a worker.
 */
export function diffLines(oldText: string, newText: string, { ignoreWhitespace = false, ignoreCase = false }: DiffLinesOptions = {}): DiffLine[] {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const normalise = (s: string) => {
    let out = ignoreWhitespace ? s.replace(/\s+/g, ' ').trim() : s;
    if (ignoreCase) out = out.toLowerCase();
    return out;
  };
  const [ia, ib] = toIds([a, b], normalise);
  const out: DiffLine[] = [];
  let removed: DiffLine[] = [];
  let added: DiffLine[] = [];
  const flush = () => {
    out.push(...removed, ...added);
    removed = [];
    added = [];
  };
  for (const e of myers(ia, ib)) {
    if (e.op === '=') {
      flush();
      out.push({ type: 'unchanged', text: b[e.b]!, oldLine: e.a + 1, newLine: e.b + 1 });
    } else if (e.op === '-') removed.push({ type: 'removed', text: a[e.a]!, oldLine: e.a + 1 });
    else added.push({ type: 'added', text: b[e.b]!, newLine: e.b + 1 });
  }
  flush();
  return out;
}

export interface WordSegment {
  text: string;
  changed: boolean;
}

const WORD_RE = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;

/** Word-level diff of two lines: the segments of each side, with changed runs marked. */
export function diffWords(oldLine: string, newLine: string): { old: WordSegment[]; new: WordSegment[] } {
  const a = oldLine.match(WORD_RE) ?? [];
  const b = newLine.match(WORD_RE) ?? [];
  const [ia, ib] = toIds([a, b], (s) => s);
  const left: WordSegment[] = [];
  const right: WordSegment[] = [];
  const push = (list: WordSegment[], text: string, changed: boolean) => {
    const last = list[list.length - 1];
    if (last && last.changed === changed) last.text += text;
    else list.push({ text, changed });
  };
  for (const e of myers(ia, ib)) {
    if (e.op === '=') {
      push(left, a[e.a]!, false);
      push(right, b[e.b]!, false);
    } else if (e.op === '-') push(left, a[e.a]!, true);
    else push(right, b[e.b]!, true);
  }
  return { old: left, new: right };
}

/** True when two lines share enough text for word highlights to help (≥ 40% unchanged). */
export function worthWordDiff(segments: { old: WordSegment[]; new: WordSegment[] }): boolean {
  const same = (list: WordSegment[]) => list.reduce((n, s) => n + (s.changed ? 0 : s.text.trim().length), 0);
  const total = (list: WordSegment[]) => list.reduce((n, s) => n + s.text.trim().length, 0);
  const shorter = Math.min(total(segments.old), total(segments.new));
  return shorter > 0 && Math.min(same(segments.old), same(segments.new)) / shorter >= 0.4;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeys((value as Record<string, unknown>)[key]);
    return out;
  }
  return value;
}

/** Pretty-printed JSON (2 spaces) with object keys sorted, so key order never shows as a change. */
export function stableStringify(value: unknown): string {
  if (value === undefined) return '';
  return JSON.stringify(sortKeys(value), null, 2) ?? '';
}

/** Diff of two JSON values (or JSON strings), compared as stable pretty-printed text. */
export function diffJson(oldValue: unknown, newValue: unknown, options?: DiffLinesOptions): DiffLine[] {
  return diffLines(toJsonText(oldValue), toJsonText(newValue), options);
}

/** A value as stable JSON text; strings are parsed first and left as they are if not JSON. */
export function toJsonText(value: unknown): string {
  if (typeof value !== 'string') return stableStringify(value);
  try {
    return stableStringify(JSON.parse(value));
  } catch {
    return value;
  }
}

/** Counts of added and removed lines. */
export function diffStats(lines: readonly DiffLine[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const line of lines) {
    if (line.type === 'added') added++;
    else if (line.type === 'removed') removed++;
  }
  return { added, removed };
}
