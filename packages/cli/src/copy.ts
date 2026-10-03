import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mapTarget, type GntikConfig } from './project.js';
import type { Registry, RegistryItem } from './registry.js';

const posix = path.posix;
const CODE_EXT = /\.(tsx?|jsx?|mts|cts|mjs|cjs)$/;
/** Packages a React project always has; never auto-installed. */
const IMPLICIT = new Set(['react', 'react-dom']);

export type FileStatus = 'create' | 'identical' | 'conflict' | 'overwrite';

export interface PlannedFile {
  id: string;
  source: string;
  /** Project-relative, posix. */
  target: string;
  status: FileStatus;
  content: string;
}

export interface Rewrite {
  file: string;
  from: string;
  to: string;
}

export interface CopyPlan {
  files: PlannedFile[];
  rewrites: Rewrite[];
  warnings: string[];
  /** npm packages the copied code imports (after rewriting). */
  packages: string[];
}

interface IndexEntry {
  item: RegistryItem;
  path: string;
  /** Matched through a directory index file (spec pointed at the folder). */
  viaDir: boolean;
}

const stripExt = (p: string) => p.replace(CODE_EXT, '');

/** Bare specifier → package name ('@scope/pkg/sub' → '@scope/pkg'). */
export function packageName(spec: string): string | null {
  if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('node:') || spec.startsWith('#')) return null;
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? null);
}

/** Every module specifier in a source file, with its position. */
const SPEC_RE = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(['"])([^'"\n]+)\2/g;

export function rewriteSpecifiers(code: string, fn: (spec: string) => string): string {
  return code.replace(SPEC_RE, (m, lead: string, q: string, spec: string) => {
    const next = fn(spec);
    return next === spec ? m : `${lead}${q}${next}${q}`;
  });
}

function buildIndex(registry: Registry) {
  const byKey = new Map<string, IndexEntry>();
  const pkgByDir = new Map<string, string>();
  for (const item of registry.items) {
    for (const f of [...item.files.map((x) => x.path), ...(item.docs ? [item.docs] : [])]) {
      const key = stripExt(f);
      if (!byKey.has(key)) byKey.set(key, { item, path: f, viaDir: false });
      if (posix.basename(key) === 'index') {
        const dir = posix.dirname(key);
        if (!byKey.has(dir)) byKey.set(dir, { item, path: f, viaDir: true });
      }
      const m = /^packages\/([^/]+)\//.exec(f);
      if (m?.[1] && !pkgByDir.has(m[1])) pkgByDir.set(m[1], item.package);
    }
  }
  return { byKey, pkgByDir };
}

/** Target for an item's doc file: next to the item's file that shares its source folder. */
function docsTarget(item: RegistryItem, config: GntikConfig): string | null {
  if (!item.docs) return null;
  const dir = posix.dirname(item.docs);
  const sibling = item.files.find((f) => posix.dirname(f.path) === dir) ?? item.files[0];
  if (!sibling) return null;
  return posix.join(posix.dirname(mapTarget(sibling.target, item.kind, config)), posix.basename(item.docs));
}

function relSpec(fromFile: string, toFile: string, keepExt: string | null, asDir: boolean): string {
  let to = asDir ? posix.dirname(toFile) : stripExt(toFile);
  if (keepExt && !asDir) to += keepExt;
  let rel = posix.relative(posix.dirname(fromFile), to);
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

/**
 * Reads the items' files from the registry, maps them to project targets and rewrites imports:
 * relative imports between copied files are re-pointed at the new locations; relative imports
 * into kit code that is not copied become package imports (e.g. '../../components/Button' →
 * '@gntik-ai/ui'). Nothing is written here.
 */
export async function planCopy(
  registry: Registry,
  items: RegistryItem[],
  config: GntikConfig,
  cwd: string,
  opts: { includeDocs?: boolean } = {},
): Promise<CopyPlan> {
  const { byKey, pkgByDir } = buildIndex(registry);
  const copyMap = new Map<string, string>();
  const sources: Array<{ item: RegistryItem; source: string }> = [];
  for (const item of items) {
    for (const f of item.files) {
      copyMap.set(f.path, mapTarget(f.target, item.kind, config));
      sources.push({ item, source: f.path });
    }
    const dt = opts.includeDocs ? docsTarget(item, config) : null;
    if (dt && item.docs) {
      copyMap.set(item.docs, dt);
      sources.push({ item, source: item.docs });
    }
  }

  const rewrites: Rewrite[] = [];
  const warnings: string[] = [];
  const packages = new Set<string>();
  const files: PlannedFile[] = [];

  for (const { item, source } of sources) {
    const target = copyMap.get(source) as string;
    let content = await registry.read(source);
    if (CODE_EXT.test(source)) {
      content = rewriteSpecifiers(content, (spec) => {
        const bare = packageName(spec);
        if (bare) {
          if (!IMPLICIT.has(bare)) packages.add(bare);
          return spec;
        }
        if (!spec.startsWith('.')) return spec;
        const extMatch = CODE_EXT.exec(spec);
        const resolved = posix.normalize(posix.join(posix.dirname(source), stripExt(spec)));
        const hit = byKey.get(resolved);
        let next = spec;
        const copiedTarget = hit ? copyMap.get(hit.path) : undefined;
        if (hit && copiedTarget) {
          next = relSpec(target, copiedTarget, extMatch?.[0] ?? null, hit.viaDir);
        } else if (hit) {
          next = hit.item.package;
        } else {
          const dir = /^packages\/([^/]+)\//.exec(resolved)?.[1];
          if (dir) {
            next = pkgByDir.get(dir) ?? `@gntik-ai/${dir}`;
            // Doc files only import the ComponentDoc type, which the package exports.
            if (source !== item.docs) {
              warnings.push(`${target}: '${spec}' is kit-internal code outside the registry; mapped to '${next}' — check that it is exported there.`);
            }
          } else {
            warnings.push(`${target}: could not resolve '${spec}'; left unchanged.`);
          }
        }
        if (next !== spec) {
          rewrites.push({ file: target, from: spec, to: next });
          const pkg = packageName(next);
          if (pkg) packages.add(pkg);
        }
        return next;
      });
    }
    const abs = path.join(cwd, target);
    let status: FileStatus = 'create';
    if (existsSync(abs)) status = (await readFile(abs, 'utf8')) === content ? 'identical' : 'conflict';
    files.push({ id: item.id, source, target, status, content });
  }
  return { files, rewrites, warnings, packages: [...packages].sort() };
}

/** Writes the plan unless it has conflicts (then nothing is written) or this is a dry run. */
export async function applyCopy(plan: CopyPlan, cwd: string, opts: { overwrite: boolean; dryRun: boolean }) {
  if (opts.overwrite) for (const f of plan.files) if (f.status === 'conflict') f.status = 'overwrite';
  const conflicts = plan.files.filter((f) => f.status === 'conflict').map((f) => f.target);
  const written: string[] = [];
  if (conflicts.length || opts.dryRun) return { conflicts, written };
  for (const f of plan.files) {
    if (f.status === 'identical') continue;
    const abs = path.join(cwd, f.target);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, f.content);
    written.push(f.target);
  }
  return { conflicts, written };
}

export const fileSummary = (f: PlannedFile) => ({ id: f.id, source: f.source, target: f.target, status: f.status });
