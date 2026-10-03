/** Minimal semver parsing (major.minor.patch, ranges like ^1.2.3 / ~1.2 / >=1.0.0); prereleases sort before their release. */
export type Version = [number, number, number, string];

export function parseVersion(input: string): Version | null {
  const m = /^[\^~>=<v\s]*(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?(?:-([0-9A-Za-z.-]+))?(?:\s|$)/.exec(input.trim());
  if (!m) return null;
  const num = (s: string | undefined) => (s === undefined || s === 'x' || s === '*' ? 0 : Number(s));
  return [num(m[1]), num(m[2]), num(m[3]), m[4] ?? ''];
}

export function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (!va || !vb) throw new Error(`Invalid version: ${va ? b : a}`);
  for (let i = 0; i < 3; i++) {
    const d = (va[i] as number) - (vb[i] as number);
    if (d) return Math.sign(d);
  }
  if (va[3] === vb[3]) return 0;
  if (!va[3]) return 1;
  if (!vb[3]) return -1;
  return va[3] < vb[3] ? -1 : 1;
}

export function isVersion(input: string): boolean {
  return parseVersion(input) !== null;
}
