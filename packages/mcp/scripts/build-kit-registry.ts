/**
 * Builds kit-registry.json (repo root): every installable item of the kit — components and
 * layouts (@gntik-ai/ui), blocks (@gntik-ai/blocks), templates (@gntik-ai/templates) and the
 * chat pack — with its source files, npm dependencies and registry dependencies. Read by
 * @gntik-ai/cli (`add`, `eject`, `list`) and the MCP server. `--check` fails when stale.
 *
 * Conventions it relies on:
 *   packages/ui/src/components/<Name>/<Name>.doc.ts      → kind "component"
 *   packages/ui/src/layouts/<Name>/<Name>.doc.ts         → kind "layout"
 *   packages/chat/src/<Name>/<Name>.doc.ts               → kind "component" (package @gntik-ai/chat)
 *   packages/blocks/src/<family>/<Name>/block.meta.ts    → kind "block"
 *   packages/templates/src/<id>/template.meta.ts         → kind "template"
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const OUT = path.join(ROOT, 'kit-registry.json');

type Kind = 'component' | 'layout' | 'block' | 'template';
interface Meta { name: string; group?: string; status?: string; description?: string; family?: string; title?: string }
interface Item {
  id: string; kind: Kind; name: string; package: string; group: string; status: string; description: string;
  files: { path: string; target: string }[]; dependencies: string[]; registryDependencies: string[]; docs?: string;
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join('/');
const isSource = (f: string) => /\.(tsx?|css)$/.test(f) && !/\.(test|doc|meta)\.tsx?$/.test(f) && !/\.(doc|meta)\.ts$/.test(f);

function walk(dir: string, skip = (d: string) => d === 'examples' || d === '__tests__'): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return skip(e.name) ? [] : walk(p, skip);
    return [p];
  }).sort();
}
const subdirs = (dir: string) =>
  fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : [];

async function load(file: string, exportName: string): Promise<Meta> {
  const mod = (await import(pathToFileURL(file).href)) as Record<string, Meta>;
  const m = mod[exportName];
  if (!m) throw new Error(`${rel(file)} has no export "${exportName}"`);
  return m;
}

const RESOLVE_EXT = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
const resolveFile = (base: string) => RESOLVE_EXT.map((e) => base + e).find((f) => fs.existsSync(f) && fs.statSync(f).isFile());

/**
 * External packages, sibling registry items and shared helper files reached from a set of files.
 * A relative import into another item's folder becomes a registry dependency; one into a file
 * that belongs to no item (a family-level helper such as billing/format.ts) is copied along
 * with the item, recursively.
 */
function scanImports(entry: string[], folderToId: Map<string, string>, self: string) {
  const deps = new Set<string>();
  const reg = new Set<string>();
  const files = new Set(entry);
  const queue = [...entry];
  while (queue.length) {
    const f = queue.pop()!;
    if (!/\.tsx?$/.test(f)) continue;
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const spec = m[1] ?? m[2] ?? '';
      if (spec.startsWith('.')) {
        const target = path.resolve(path.dirname(f), spec);
        let owner: string | undefined;
        for (const [folder, id] of folderToId) {
          if (target === folder || target.startsWith(folder + path.sep)) owner = id;
        }
        if (owner && owner !== self) reg.add(owner);
        if (!owner) {
          const file = resolveFile(target);
          if (file && !files.has(file) && !/\.(test|doc|meta)\.tsx?$/.test(file)) {
            files.add(file);
            queue.push(file);
          }
        }
      } else {
        const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]!;
        if (!['react', 'react-dom'].includes(name)) deps.add(name);
      }
    }
  }
  return { dependencies: [...deps].sort(), registryDependencies: [...reg].sort(), files: [...files].sort() };
}

interface Source { kind: Kind; pkg: string; dir: string; metaFile: string; metaExport: string; targetBase: string; id?: string; meta?: Meta }

function collectSources(): Source[] {
  const out: Source[] = [];
  // Shared internals every ejected component needs (cn/tv helpers, theme + presets).
  out.push({ kind: 'component', pkg: '@gntik-ai/ui', dir: path.join(ROOT, 'packages/ui/src/utils'), metaFile: '', metaExport: '', targetBase: 'components/utils', id: 'ui-utils',
    meta: { name: 'UI utilities', group: 'Utilities', description: 'cn() class merging and tv() variants helpers used by every component.' } });
  out.push({ kind: 'component', pkg: '@gntik-ai/ui', dir: path.join(ROOT, 'packages/ui/src/theme'), metaFile: '', metaExport: '', targetBase: 'components/theme', id: 'theme',
    meta: { name: 'ThemeProvider', group: 'Theme', description: 'ThemeProvider (dark default, light, high contrast, system; persisted), themeScript, Logo and brand presets.' } });
  const doc = (kind: Kind, pkg: string, base: string, targetBase: string) => {
    for (const name of subdirs(base)) {
      const f = path.join(base, name, `${name}.doc.ts`);
      if (fs.existsSync(f)) out.push({ kind, pkg, dir: path.join(base, name), metaFile: f, metaExport: 'doc', targetBase: `${targetBase}/${kebab(name)}` });
    }
  };
  doc('component', '@gntik-ai/ui', path.join(ROOT, 'packages/ui/src/components'), 'components/ui');
  doc('layout', '@gntik-ai/ui', path.join(ROOT, 'packages/ui/src/layouts'), 'components/layouts');
  doc('component', '@gntik-ai/chat', path.join(ROOT, 'packages/chat/src'), 'components/chat');
  const blocks = path.join(ROOT, 'packages/blocks/src');
  for (const family of subdirs(blocks)) {
    for (const name of subdirs(path.join(blocks, family))) {
      const f = path.join(blocks, family, name, 'block.meta.ts');
      if (fs.existsSync(f)) out.push({ kind: 'block', pkg: '@gntik-ai/blocks', dir: path.dirname(f), metaFile: f, metaExport: 'meta', targetBase: `components/blocks/${family}/${kebab(name)}` });
    }
  }
  const templates = path.join(ROOT, 'packages/templates/src');
  for (const id of subdirs(templates)) {
    const f = path.join(templates, id, 'template.meta.ts');
    if (fs.existsSync(f)) out.push({ kind: 'template', pkg: '@gntik-ai/templates', dir: path.dirname(f), metaFile: f, metaExport: 'meta', targetBase: `app/templates/${id}` });
  }
  return out;
}

async function build() {
  const sources = collectSources();
  const idOf = (s: Source) => s.id ?? (s.kind === 'template' ? path.basename(s.dir) : kebab(path.basename(s.dir)));
  const folderToId = new Map(sources.map((s) => [s.dir, idOf(s)] as const));
  const items: Item[] = [];
  for (const s of sources) {
    const meta = s.meta ?? (await load(s.metaFile, s.metaExport));
    const id = idOf(s);
    const own = walk(s.dir).filter((f) => isSource(path.basename(f)));
    const { dependencies, registryDependencies, files } = scanImports(own, folderToId, id);
    // Shared helpers live outside the item folder: keep their path relative to the package src.
    const srcRoot = s.dir.slice(0, s.dir.indexOf(`${path.sep}src${path.sep}`) + 5);
    const targetRoot = s.targetBase.split('/').slice(0, -path.relative(srcRoot, s.dir).split(path.sep).length).join('/');
    items.push({
      id,
      kind: s.kind,
      name: meta.name ?? meta.title ?? id,
      package: s.pkg,
      group: meta.group ?? meta.family ?? '',
      status: meta.status ?? 'stable',
      description: meta.description ?? '',
      files: files.map((f) => ({
        path: rel(f),
        target: f.startsWith(s.dir + path.sep)
          ? `${s.targetBase}/${path.relative(s.dir, f).split(path.sep).join('/')}`
          : `${targetRoot}/${path.relative(srcRoot, f).split(path.sep).join('/')}`,
      })),
      dependencies,
      registryDependencies,
      ...(s.metaFile ? { docs: rel(s.metaFile) } : {}),
    });
  }
  const dup = items.map((i) => i.id).find((id, i, all) => all.indexOf(id) !== i);
  if (dup) throw new Error(`duplicate registry id "${dup}"`);
  items.sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
  return JSON.stringify({ version: 1, items }, null, 2) + '\n';
}

const json = await build();
if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== json) {
    console.error('kit-registry.json is stale — run `pnpm registry`.');
    process.exit(1);
  }
  console.log('kit-registry.json is up to date.');
} else {
  fs.writeFileSync(OUT, json);
  const counts = JSON.parse(json).items.reduce((a: Record<string, number>, i: Item) => ((a[i.kind] = (a[i.kind] ?? 0) + 1), a), {});
  console.log(`kit-registry.json written: ${JSON.stringify(counts)}`);
}
