import { diffWords, worthWordDiff, type DiffLine, type WordSegment } from './diff';

/** A line plus its word segments when it is paired with a counterpart. */
export interface ViewLine extends DiffLine {
  index: number;
  words?: WordSegment[];
}

/** One rendered row: a line pair (split), a single line (unified) or a collapsed run. */
export type ViewItem =
  | { kind: 'lines'; key: string; left?: ViewLine; right?: ViewLine; line?: ViewLine }
  | { kind: 'collapsed'; key: string; count: number };

/** Adds word segments to removed/added lines paired by position within each changed block. */
export function pairLines(lines: readonly DiffLine[], wordDiff: boolean): { lines: ViewLine[]; pairs: Map<number, number> } {
  const out: ViewLine[] = lines.map((line, index) => ({ ...line, index }));
  const pairs = new Map<number, number>();
  let i = 0;
  while (i < out.length) {
    if (out[i]!.type === 'unchanged') {
      i++;
      continue;
    }
    const removed: number[] = [];
    const added: number[] = [];
    while (i < out.length && out[i]!.type === 'removed') removed.push(i++);
    while (i < out.length && out[i]!.type === 'added') added.push(i++);
    for (let p = 0; p < Math.min(removed.length, added.length); p++) {
      const r = removed[p]!;
      const a = added[p]!;
      pairs.set(r, a);
      if (!wordDiff) continue;
      const segments = diffWords(out[r]!.text, out[a]!.text);
      if (!worthWordDiff(segments)) continue;
      out[r] = { ...out[r]!, words: segments.old };
      out[a] = { ...out[a]!, words: segments.new };
    }
  }
  return { lines: out, pairs };
}

/**
 * Ranges of unchanged lines to hide: runs longer than `context` lines on each side of a change
 * (only one side at the start or end of the file). Returns [start, end) index ranges.
 */
export function collapsibleRanges(lines: readonly DiffLine[], context: number, minHidden = 2): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  if (!Number.isFinite(context)) return ranges;
  let i = 0;
  while (i < lines.length) {
    if (lines[i]!.type !== 'unchanged') {
      i++;
      continue;
    }
    const start = i;
    while (i < lines.length && lines[i]!.type === 'unchanged') i++;
    const from = start === 0 ? start : start + context;
    const to = i === lines.length ? i : i - context;
    if (to - from >= minHidden) ranges.push([from, to]);
  }
  return ranges;
}

/** Rows for the unified view. */
export function unifiedItems(lines: readonly ViewLine[], hidden: ReadonlyArray<[number, number]>): ViewItem[] {
  const items: ViewItem[] = [];
  let r = 0;
  for (let i = 0; i < lines.length; i++) {
    const range = hidden[r];
    if (range && i === range[0]) {
      items.push({ kind: 'collapsed', key: `c${range[0]}`, count: range[1] - range[0] });
      i = range[1] - 1;
      r++;
      continue;
    }
    items.push({ kind: 'lines', key: `l${i}`, line: lines[i]! });
  }
  return items;
}

/** Rows for the split view: unchanged lines on both sides, removed left and added right. */
export function splitItems(lines: readonly ViewLine[], hidden: ReadonlyArray<[number, number]>): ViewItem[] {
  const items: ViewItem[] = [];
  let r = 0;
  let i = 0;
  while (i < lines.length) {
    const range = hidden[r];
    if (range && i === range[0]) {
      items.push({ kind: 'collapsed', key: `c${range[0]}`, count: range[1] - range[0] });
      i = range[1];
      r++;
      continue;
    }
    const line = lines[i]!;
    if (line.type === 'unchanged') {
      items.push({ kind: 'lines', key: `l${i}`, left: line, right: line });
      i++;
      continue;
    }
    const removed: ViewLine[] = [];
    const added: ViewLine[] = [];
    while (i < lines.length && lines[i]!.type === 'removed') removed.push(lines[i++]!);
    while (i < lines.length && lines[i]!.type === 'added') added.push(lines[i++]!);
    for (let p = 0; p < Math.max(removed.length, added.length); p++) {
      const left = removed[p];
      const right = added[p];
      items.push({ kind: 'lines', key: `p${(left ?? right)!.index}`, left, right });
    }
  }
  return items;
}
