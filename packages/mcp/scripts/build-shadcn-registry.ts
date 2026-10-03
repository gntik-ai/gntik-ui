/**
 * Builds a shadcn-compatible registry from kit-registry.json, so any React + Tailwind 4 app can
 * install a kit item with the shadcn CLI:
 *
 *   npx shadcn@latest add <base>/r/<id>.json
 *
 * Output (served by the docs site, apps/docs/public → <base>/):
 *   apps/docs/public/r/registry.json   index (https://ui.shadcn.com/schema/registry.json)
 *   apps/docs/public/r/<id>.json       one item each (https://ui.shadcn.com/schema/registry-item.json)
 *
 * Shapes match the shadcn 4.x zod schemas (@shadcn/registry/schema: registrySchema,
 * registryItemSchema). Mapping:
 *   component → registry:ui      layout, block, template → registry:block
 *   (templates are not registry:page: the CLI maps page targets onto Next.js routes and
 *    drops them in other frameworks; every file here carries an explicit `target`.)
 *   + `gntik-tokens` (registry:theme): @gntik-ai/tokens + Geist fonts as npm dependencies and
 *     their CSS @imports merged into the app's Tailwind CSS file. Every item depends on it.
 *
 * Files keep the kit-registry targets (kebab folders mirroring the source tree, the same ones
 * `gntik-ui add` writes; shadcn prefixes `src/` when the app has one). Relative imports are
 * rewritten to those targets, so `../Spinner` in Button becomes `../spinner` — kit-internal
 * imports keep resolving after the copy. A relative import into kit code that no item owns
 * becomes a package import (as in the CLI) and is reported.
 *
 * registryDependencies are absolute URLs `<base>/r/<dep>.json`. The base comes from
 * GNTIK_REGISTRY_BASE_URL (no trailing slash). Its default, https://gntik-ui.invalid, is a
 * deliberate placeholder: the reserved `.invalid` TLD never resolves, so a registry generated
 * without the variable fails loudly instead of pointing at a host someone else could own.
 * Generate the published copy with the docs' real origin, e.g.
 *   GNTIK_REGISTRY_BASE_URL=https://<docs-host> pnpm registry
 * (`--check` must run with the same value.)
 *
 * Usage: tsx scripts/build-shadcn-registry.ts [--check] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const SCHEMA_ITEM = 'https://ui.shadcn.com/schema/registry-item.json';
const SCHEMA_INDEX = 'https://ui.shadcn.com/schema/registry.json';
export const PLACEHOLDER_BASE = 'https://gntik-ui.invalid';
export const TOKENS_ID = 'gntik-tokens';

type Kind = 'component' | 'layout' | 'block' | 'template';
interface KitFile { path: string; target: string }
interface KitItem {
  id: string; kind: Kind; name: string; package: string; group: string; status: string; description: string;
  files: KitFile[]; dependencies: string[]; registryDependencies: string[]; docs?: string;
}
type ShadcnType = 'registry:ui' | 'registry:block' | 'registry:component' | 'registry:lib' | 'registry:hook' | 'registry:theme';
interface ShadcnFile { path: string; type: ShadcnType; target: string; content?: string }
type Css = Record<string, Record<string, string>>;
interface ShadcnItem {
  $schema?: string; name: string; type: ShadcnType; title: string; description: string; author: string;
  dependencies: string[]; registryDependencies: string[]; files: ShadcnFile[];
  css?: Css; docs?: string; categories: string[]; meta: Record<string, string>;
}

const posix = path.posix;
const CODE_EXT = /\.(tsx?|jsx?|mts|cts|mjs|cjs)$/;
const stripExt = (p: string) => p.replace(CODE_EXT, '');
const SPEC_RE = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(['"])([^'"\n]+)\2/g;
const IMPLICIT = new Set(['react', 'react-dom']);
const FONT_IMPORTS = ['@fontsource/geist', '@fontsource/geist-mono', '@fontsource/geist/500.css', '@fontsource/geist/600.css',
  '@fontsource/geist/700.css', '@fontsource/geist-mono/500.css'];
const NPMRC = '@gntik-ai:registry=https://npm.pkg.github.com';

const pkgName = (spec: string) => (spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]!);
const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8')) as T;

interface PackageJson { name: string; version: string; exports?: Record<string, unknown>; dependencies?: Record<string, string>; peerDependencies?: Record<string, string> }

/** Workspace packages: name → package.json, and the version ranges they declare for npm deps. */
function workspace() {
  const pkgs = new Map<string, PackageJson & { dir: string }>();
  const ranges = new Map<string, string>();
  for (const dir of fs.readdirSync(path.join(ROOT, 'packages'))) {
    const f = path.join(ROOT, 'packages', dir, 'package.json');
    if (!fs.existsSync(f)) continue;
    const pj = readJson<PackageJson>(f);
    pkgs.set(pj.name, { ...pj, dir });
    for (const [n, r] of Object.entries({ ...pj.peerDependencies, ...pj.dependencies })) {
      if (!r.startsWith('workspace:') && !ranges.has(n)) ranges.set(n, r);
    }
  }
  return { pkgs, ranges };
}

/** shadcn dependency spec: kit packages bare (resolved through the user's .npmrc scope), others with their range. */
function depSpec(name: string, ranges: Map<string, string>) {
  if (name.startsWith('@gntik-ai/')) return name;
  const r = ranges.get(name);
  return r ? `${name}@${r}` : name;
}

function shadcnType(kind: Kind): ShadcnType {
  return kind === 'component' ? 'registry:ui' : 'registry:block';
}
function fileType(kind: Kind, target: string): ShadcnType {
  if (kind === 'component') return 'registry:ui';
  if (/\/use-[^/]+\.tsx?$/.test(target)) return 'registry:hook';
  return target.endsWith('.tsx') ? 'registry:component' : 'registry:lib';
}

/** Target folder each package's src/ maps to (most common across items whose targets mirror the source). */
function packageRoots(items: KitItem[]) {
  const votes = new Map<string, Map<string, number>>();
  for (const i of items) {
    for (const f of i.files) {
      const m = /^packages\/([^/]+)\/src\/(.+)$/.exec(f.path);
      if (!m || !f.target.endsWith(`/${m[2]}`)) continue;
      const root = f.target.slice(0, -m[2]!.length - 1);
      const v = votes.get(m[1]!) ?? new Map<string, number>();
      v.set(root, (v.get(root) ?? 0) + 1);
      votes.set(m[1]!, v);
    }
  }
  return new Map([...votes].map(([pkg, v]) => [pkg, [...v].sort((a, b) => b[1] - a[1])[0]![0]]));
}

export interface BuildResult { files: Map<string, string>; warnings: string[] }

export function build(opts: { baseUrl?: string; kitRegistry?: string } = {}): BuildResult {
  const base = (opts.baseUrl ?? process.env.GNTIK_REGISTRY_BASE_URL ?? PLACEHOLDER_BASE).replace(/\/+$/, '');
  if (!/^https?:\/\/[^/]+/.test(base)) throw new Error(`GNTIK_REGISTRY_BASE_URL must be an absolute http(s) URL, got "${base}"`);
  const kit = readJson<{ items: KitItem[] }>(opts.kitRegistry ?? path.join(ROOT, 'kit-registry.json'));
  const { pkgs, ranges } = workspace();
  const url = (id: string) => `${base}/r/${id}.json`;
  const byId = new Map(kit.items.map((i) => [i.id, i]));
  if (byId.has(TOKENS_ID)) throw new Error(`kit-registry.json already has an item "${TOKENS_ID}"`);

  // Every kit file by extension-less path (and folder, for index files), per owning item.
  const keyed = (files: KitFile[]) => {
    const m = new Map<string, { file: KitFile; viaDir: boolean }>();
    for (const file of files) {
      const key = stripExt(file.path);
      if (!m.has(key)) m.set(key, { file, viaDir: false });
      if (posix.basename(key) === 'index' && !m.has(posix.dirname(key))) m.set(posix.dirname(key), { file, viaDir: true });
    }
    return m;
  };
  const owned = new Map(kit.items.map((i) => [i.id, keyed(i.files)]));
  const anyOwner = new Map<string, KitItem>();
  for (const i of kit.items) for (const key of owned.get(i.id)!.keys()) if (!anyOwner.has(key)) anyOwner.set(key, i);
  const roots = packageRoots(kit.items);
  const closure = (id: string, seen = new Set<string>()) => {
    if (seen.has(id)) return seen;
    seen.add(id);
    for (const d of byId.get(id)?.registryDependencies ?? []) closure(d, seen);
    return seen;
  };

  const warnings: string[] = [];
  const out = new Map<string, string>();
  const write = (name: string, data: unknown) => out.set(name, JSON.stringify(data, null, 2) + '\n');
  const summaries: ShadcnItem[] = [];

  // ── gntik-tokens: the brand layer every item stands on ────────────────────────────────
  const tokensPkg = pkgs.get('@gntik-ai/tokens');
  if (!tokensPkg) throw new Error('packages/tokens/package.json not found');
  const tokens: ShadcnItem = {
    $schema: SCHEMA_ITEM,
    name: TOKENS_ID,
    type: 'registry:theme',
    title: 'gntik-ui brand tokens',
    description: 'Brand tokens (dark, light, high contrast) as CSS variables plus the Tailwind 4 bridge and Geist fonts. Every gntik-ui item depends on it.',
    author: 'gntik-ai',
    dependencies: ['@gntik-ai/tokens', ...['@fontsource/geist', '@fontsource/geist-mono'].map((d) => depSpec(d, ranges))],
    registryDependencies: [],
    files: [],
    css: Object.fromEntries([...FONT_IMPORTS, '@gntik-ai/tokens/tailwind.css'].map((s) => [`@import "${s}"`, {}])),
    docs: `gntik-ui packages are published to GitHub Packages: add \`${NPMRC}\` to .npmrc (with a token that can read packages). The theme class goes on <html>: "dark" (default), "" (light) or "high_contrast". If the app was set up with \`shadcn init\`, remove its :root/.dark variables and @theme block from the CSS file: @gntik-ai/tokens/tailwind.css defines them.`,
    categories: ['theme'],
    meta: { package: '@gntik-ai/tokens', version: tokensPkg.version },
  };

  for (const item of kit.items) {
    const reach = [...closure(item.id)];
    const mine = owned.get(item.id)!;
    const files: ShadcnFile[] = [];
    const queue: KitFile[] = [...item.files];
    const queued = new Set(queue.map((f) => f.path));
    const enqueue = (file: KitFile) => {
      if (queued.has(file.path)) return;
      queued.add(file.path);
      queue.push(file);
      mine.set(stripExt(file.path), { file, viaDir: false });
    };
    /** Where an import of `resolved` (extension-less repo path) lands once copied, if it is copied. */
    const locate = (resolved: string) => {
      for (const id of reach) {
        const hit = (id === item.id ? mine : owned.get(id))?.get(resolved);
        if (hit) return hit;
      }
      // The item's own doc file (index.ts re-exports it), copied next to its sibling files.
      if (item.docs && stripExt(item.docs) === resolved) {
        const sibling = item.files.find((f) => posix.dirname(f.path) === posix.dirname(item.docs!)) ?? item.files[0]!;
        const file = { path: item.docs, target: posix.join(posix.dirname(sibling.target), posix.basename(item.docs)) };
        enqueue(file);
        return { file, viaDir: false };
      }
      // Shared kit code no item owns (e.g. ui/src/doc.ts): copied along, mirrored under the package root.
      const m = /^packages\/([^/]+)\/src\/(.+)$/.exec(resolved);
      const root = m ? roots.get(m[1]!) : undefined;
      const suffix = ['.ts', '.tsx', '/index.ts', '/index.tsx'].find((e) => fs.statSync(path.join(ROOT, resolved + e), { throwIfNoEntry: false })?.isFile());
      if (m && root !== undefined && suffix && !anyOwner.has(resolved)) {
        const file = { path: resolved + suffix, target: `${root}/${m[2]}${suffix}` };
        enqueue(file);
        return { file, viaDir: suffix.startsWith('/') };
      }
      return undefined;
    };
    while (queue.length) {
      const file = queue.shift()!;
      let content = fs.readFileSync(path.join(ROOT, file.path), 'utf8');
      if (CODE_EXT.test(file.path)) {
        content = content.replace(SPEC_RE, (m, lead: string, q: string, spec: string) => {
          if (!spec.startsWith('.')) return m;
          const ext = CODE_EXT.exec(spec)?.[0] ?? null;
          const resolved = posix.normalize(posix.join(posix.dirname(file.path), stripExt(spec)));
          const hit = locate(resolved);
          let next: string;
          if (hit) {
            let to = hit.viaDir ? posix.dirname(hit.file.target) : stripExt(hit.file.target);
            if (ext && !hit.viaDir) to += ext;
            next = posix.relative(posix.dirname(file.target), to);
            if (!next.startsWith('.')) next = `./${next}`;
          } else if (!['', '.ts', '.tsx', '/index.ts', '/index.tsx'].some((e) => fs.existsSync(path.join(ROOT, resolved + e)))) {
            return m; // not a real module (e.g. an import inside a code sample string)
          } else {
            const dir = /^packages\/([^/]+)\//.exec(resolved)?.[1];
            const pkg = anyOwner.get(resolved)?.package ?? [...pkgs.values()].find((p) => p.dir === dir)?.name;
            if (!pkg) throw new Error(`${file.path}: cannot resolve '${spec}'`);
            next = pkg;
            warnings.push(`${item.id}: ${file.target}: '${spec}' is kit code outside the item's dependencies; mapped to '${pkg}'.`);
          }
          return next === spec ? m : `${lead}${q}${next}${q}`;
        });
      }
      files.push({ path: file.path, type: fileType(item.kind, file.target), target: file.target, content });
    }

    // npm deps: what the kit-registry lists plus any package an import was rewritten to.
    const npm = new Set(item.dependencies);
    for (const f of files) {
      for (const m of (f.content ?? '').matchAll(SPEC_RE)) {
        const spec = m[3]!;
        if (!spec.startsWith('.') && !spec.startsWith('node:')) npm.add(pkgName(spec));
      }
    }
    for (const n of IMPLICIT) npm.delete(n);
    const kitPkgs = [...npm].filter((n) => n.startsWith('@gntik-ai/')).sort((a, b) => (a === '@gntik-ai/ui' ? -1 : b === '@gntik-ai/ui' ? 1 : a.localeCompare(b)));
    // Packaged kit code is compiled; its styles.css tells Tailwind to scan it (ui first: it brings the tokens).
    const cssImports = kitPkgs.filter((n) => pkgs.get(n)?.exports?.['./styles.css']).map((n) => `${n}/styles.css`);

    const shadcn: ShadcnItem = {
      $schema: SCHEMA_ITEM,
      name: item.id,
      type: shadcnType(item.kind),
      title: item.name,
      description: item.description,
      author: 'gntik-ai',
      dependencies: [...npm].sort().map((d) => depSpec(d, ranges)),
      registryDependencies: [TOKENS_ID, ...item.registryDependencies].map(url),
      files,
      ...(cssImports.length ? { css: Object.fromEntries(cssImports.map((s) => [`@import "${s}"`, {}])) } : {}),
      categories: [item.kind, ...(item.group ? [item.group] : [])],
      meta: { kind: item.kind, package: item.package, status: item.status, ...(item.docs ? { source: item.docs } : {}) },
    };
    write(`${item.id}.json`, shadcn);
    summaries.push(shadcn);
  }
  write(`${TOKENS_ID}.json`, tokens);

  const strip = (item: ShadcnItem) => {
    const { $schema, files, ...rest } = item;
    void $schema;
    return { ...rest, files: files.map((f) => ({ path: f.path, type: f.type, target: f.target })) };
  };
  write('registry.json', {
    $schema: SCHEMA_INDEX,
    name: 'gntik-ui',
    homepage: base,
    items: [strip(tokens), ...summaries.sort((a, b) => a.name.localeCompare(b.name)).map(strip)],
  });
  return { files: out, warnings };
}

/** Writes the files into `dir`, removing stale *.json there; or, with check, lists differences. */
export function sync(dir: string, files: Map<string, string>, check: boolean): string[] {
  const existing = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  const stale = existing.filter((f) => !files.has(f));
  const changed = [...files].filter(([f, c]) => !fs.existsSync(path.join(dir, f)) || fs.readFileSync(path.join(dir, f), 'utf8') !== c).map(([f]) => f);
  if (check) return [...changed, ...stale.map((f) => `${f} (stale)`)];
  fs.mkdirSync(dir, { recursive: true });
  for (const f of stale) fs.rmSync(path.join(dir, f));
  for (const f of changed) fs.writeFileSync(path.join(dir, f), files.get(f)!);
  return [...changed, ...stale];
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf('--out');
  const outDir = outIdx >= 0 && argv[outIdx + 1] ? path.resolve(argv[outIdx + 1]!) : path.join(ROOT, 'apps/docs/public/r');
  const check = argv.includes('--check');
  const { files, warnings } = build();
  for (const w of warnings) console.warn(`warning: ${w}`);
  const diff = sync(outDir, files, check);
  const where = path.relative(ROOT, outDir) || '.';
  if (check) {
    if (diff.length) {
      console.error(`${where} is stale (${diff.length} file(s): ${diff.slice(0, 5).join(', ')}${diff.length > 5 ? '…' : ''}) — run \`pnpm registry\`.`);
      process.exit(1);
    }
    console.log(`${where}: shadcn registry is up to date (${files.size} files).`);
  } else {
    console.log(`${where}: shadcn registry written — ${files.size - 1} items, ${diff.length} file(s) changed.`);
  }
}
