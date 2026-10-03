import { compareVersions, isVersion } from './semver.js';
import { codemod as chipTextAliases } from './transforms/chip-text-aliases.js';
import { codemod as flowBuilderControlledConsole } from './transforms/flow-builder-controlled-console.js';
import { codemod as linkUnderlineDefault } from './transforms/link-underline-default.js';
import { codemod as templatesRenamedIds } from './transforms/templates-renamed-ids.js';
import type { Codemod, CodemodMeta } from './types.js';

/** Every transform, in the order they run (oldest breaking change first). */
export const codemods: readonly Codemod[] = [templatesRenamedIds, flowBuilderControlledConsole, chipTextAliases, linkUnderlineDefault];

/** Metadata of every transform (what `gntik-ui upgrade --list` prints). */
export const transforms: readonly CodemodMeta[] = codemods.map((c) => c.meta);

export function getCodemod(id: string): Codemod | undefined {
  return codemods.find((c) => c.meta.id === id);
}

export interface SelectOptions {
  /**
   * Version upgrading from: one version for every package, or per package (`{ '@gntik-ai/ui': '0.1.0' }`).
   * Packages missing from the map use the lowest version in it; with no versions at all every transform applies.
   */
  from?: string | Record<string, string>;
  /** Version upgrading to (default: latest — no upper bound). */
  to?: string;
  /** Only these ids (still subject to from/to unless `force`). */
  only?: string[];
  skip?: string[];
  /** Run `only` regardless of from/to. */
  force?: boolean;
}

function fromFor(meta: CodemodMeta, from: SelectOptions['from']): string | null {
  if (from === undefined) return null;
  if (typeof from === 'string') return from;
  const own = from[meta.package];
  if (own !== undefined && isVersion(own)) return own;
  const all = Object.values(from).filter(isVersion);
  if (!all.length) return null;
  return all.reduce((min, v) => (compareVersions(v, min) < 0 ? v : min));
}

/** True when an upgrade from → to crosses the transform's toVersion. */
export function appliesTo(meta: CodemodMeta, from: string | null, to: string | undefined): boolean {
  if (from !== null && isVersion(from) && compareVersions(from, meta.toVersion) >= 0) return false;
  if (to !== undefined && to !== 'latest' && compareVersions(to, meta.toVersion) < 0) return false;
  return true;
}

/** The transforms an upgrade needs, in run order. Throws on unknown ids or invalid versions. */
export function selectTransforms(options: SelectOptions = {}): CodemodMeta[] {
  const known = new Set(transforms.map((t) => t.id));
  for (const id of [...(options.only ?? []), ...(options.skip ?? [])]) if (!known.has(id)) throw new Error(`Unknown codemod "${id}"`);
  for (const v of [typeof options.from === 'string' ? options.from : undefined, options.to === 'latest' ? undefined : options.to]) {
    if (v !== undefined && !isVersion(v)) throw new Error(`Invalid version "${v}"`);
  }
  const skip = new Set(options.skip ?? []);
  const only = options.only?.length ? new Set(options.only) : null;
  return transforms.filter((t) => {
    if (skip.has(t.id)) return false;
    if (only && !only.has(t.id)) return false;
    if (only && options.force) return true;
    return appliesTo(t, fromFor(t, options.from), options.to);
  });
}
