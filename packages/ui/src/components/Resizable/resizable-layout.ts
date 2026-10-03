/** Pure layout math and persistence for ResizablePanelGroup (sizes are % of the group). */

export interface PanelConstraints {
  id: string;
  defaultSize?: number;
  minSize: number;
  maxSize: number;
  collapsible: boolean;
  collapsedSize: number;
}

const EPSILON = 0.01;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function isCollapsed(size: number, panel: PanelConstraints) {
  return panel.collapsible && size <= panel.collapsedSize + EPSILON;
}

/** Default sizes: explicit `defaultSize`s first, the remainder shared by the panels without one. */
export function defaultSizes(panels: PanelConstraints[]): number[] {
  const fixed = panels.reduce((sum, p) => sum + (p.defaultSize ?? 0), 0);
  const free = panels.filter((p) => p.defaultSize == null).length;
  const share = free ? Math.max(0, 100 - fixed) / free : 0;
  const raw = panels.map((p) => clamp(p.defaultSize ?? share, p.minSize, p.maxSize));
  const sum = raw.reduce((a, b) => a + b, 0);
  return sum > 0 ? raw.map((s) => (s / sum) * 100) : raw;
}

/**
 * New size for panel A of the adjacent pair (A, B) when the handle between them is dragged
 * towards `target`. B absorbs the difference; min / max of both are respected, and a collapsible
 * panel snaps shut once dragged past half of its minimum.
 */
export function resolvePair(target: number, a: PanelConstraints, b: PanelConstraints, total: number): number {
  if (a.collapsible && target <= (a.collapsedSize + a.minSize) / 2 && total - a.collapsedSize <= b.maxSize) {
    return a.collapsedSize;
  }
  if (b.collapsible && total - target <= (b.collapsedSize + b.minSize) / 2 && total - b.collapsedSize <= a.maxSize) {
    return total - b.collapsedSize;
  }
  const lo = Math.max(a.minSize, total - b.maxSize);
  const hi = Math.min(a.maxSize, total - b.minSize);
  return lo <= hi ? clamp(target, lo, hi) : clamp(target, hi, lo);
}

/** Returns a copy of `sizes` with panel `i` set to `nextA` and panel `i + 1` taking the rest of the pair. */
export function setPair(sizes: number[], i: number, nextA: number): number[] {
  const a = sizes[i];
  const b = sizes[i + 1];
  if (a == null || b == null) return sizes;
  const next = sizes.slice();
  next[i] = nextA;
  next[i + 1] = a + b - nextA;
  return next;
}

/** Moves the handle after panel `i` so that panel `i` aims for `target` (%). */
export function movePair(sizes: number[], panels: PanelConstraints[], i: number, target: number): number[] {
  const a = panels[i];
  const b = panels[i + 1];
  const sa = sizes[i];
  const sb = sizes[i + 1];
  if (!a || !b || sa == null || sb == null) return sizes;
  return setPair(sizes, i, resolvePair(target, a, b, sa + sb));
}

const storageKey = (id: string) => `gntik-ui:resizable:${id}`;

/** Reads persisted sizes; returns null when missing, malformed or not matching the panel count. */
export function loadSizes(autoSaveId: string | undefined, count: number): number[] | null {
  if (!autoSaveId) return null;
  try {
    const raw = localStorage.getItem(storageKey(autoSaveId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== count) return null;
    if (!parsed.every((n): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0)) return null;
    const sum = parsed.reduce((a, b) => a + b, 0);
    return Math.abs(sum - 100) < 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSizes(autoSaveId: string | undefined, sizes: number[]) {
  if (!autoSaveId) return;
  try {
    localStorage.setItem(storageKey(autoSaveId), JSON.stringify(sizes.map((s) => Math.round(s * 100) / 100)));
  } catch {}
}
